import React, { useState, useCallback } from 'react';
import { ArticleTask, WordPressSite, VirtualAssistant } from '../types';
import * as XLSX from 'xlsx';

interface ImportTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tasks: Omit<ArticleTask, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  sites: WordPressSite[];
  vas: VirtualAssistant[];
}

interface ImportResult {
    successCount: number;
    errorCount: number;
    errors: string[];
}

type ImportStep = 'upload' | 'mapping' | 'result';

// Redefined required fields based on user request.
// 'VA' is removed. 'blog' is added as an alias for 'website'.
const REQUIRED_FIELDS = [
    { key: 'link', name: 'Link', aliases: ['link', 'url', 'link article'] },
    { key: 'keywords', name: 'Keywords', aliases: ['keywords', 'tags'] },
    { key: 'board', name: 'Board', aliases: ['board'] },
    { key: 'annotatedInterests', name: 'Annotated Interests', aliases: ['annotated interests', 'interests', 'topic'] },
    { key: 'topTitle', name: 'Top Title', aliases: ['top title', 'title', 'headline'] },
    { key: 'category', name: 'Category Recipes', aliases: ['category recipes', 'category', 'category name'] },
    { key: 'blog', name: 'Blog', aliases: ['blog', 'website', 'site'] },
];

const ImportTasksModal: React.FC<ImportTasksModalProps> = ({ isOpen, onClose, onImport, sites, vas }) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string | null>>({});
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const resetState = useCallback(() => {
    setStep('upload');
    setFile(null);
    setJsonData([]);
    setFileHeaders([]);
    setColumnMappings({});
    setIsProcessing(false);
    setImportResult(null);
  }, []);

  const resetAndClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      resetState();
      setFile(selectedFile);
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (!content) {
          setImportResult({ successCount: 0, errorCount: 1, errors: ["File is empty or could not be read."] });
          setStep('result');
          setIsProcessing(false);
          return;
        }
        
        try {
            const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');
            const workbook = isExcel
                ? XLSX.read(content, { type: 'array' })
                : XLSX.read(content, { type: 'string' });

            const sheetName = workbook.SheetNames[0];
            if (!sheetName) throw new Error("File contains no sheets.");

            const worksheet = workbook.Sheets[sheetName];
            const data: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (data.length === 0) {
                 setImportResult({ successCount: 0, errorCount: 1, errors: ["File is empty or has no data rows."] });
                 setStep('result');
                 setIsProcessing(false);
                 return;
            }

            setJsonData(data);
            const headers = Object.keys(data[0] || {});
            setFileHeaders(headers);

            const normalizedFileHeaders = headers.map(h => ({ original: h, normalized: h.toLowerCase().trim() }));
            const newMappings: Record<string, string | null> = {};

            REQUIRED_FIELDS.forEach(field => {
                newMappings[field.key] = null;
                for (const alias of field.aliases) {
                    const foundHeader = normalizedFileHeaders.find(h => h.normalized === alias);
                    if (foundHeader) {
                        newMappings[field.key] = foundHeader.original;
                        break;
                    }
                }
            });
            setColumnMappings(newMappings);
            setStep('mapping');
        } catch (error) {
            console.error("File parsing error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during parsing.";
            setImportResult({ successCount: 0, errorCount: 1, errors: [`Failed to parse file: ${errorMessage}`] });
            setStep('result');
        } finally {
            setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setImportResult({ successCount: 0, errorCount: 1, errors: ["Failed to read the file."] });
        setStep('result');
        setIsProcessing(false);
      };
      
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(selectedFile);
      } else {
        reader.readAsText(selectedFile);
      }
    }
  };
  
  const handleMappingChange = (fieldKey: string, headerName: string) => {
      setColumnMappings(prev => ({
          ...prev,
          [fieldKey]: headerName === '' ? null : headerName,
      }));
  };

  const handleImport = () => {
    const isMappingComplete = REQUIRED_FIELDS.every(field => columnMappings[field.key] !== null);
    if (!isMappingComplete) {
        alert("Please map all required fields before importing.");
        return;
    }
    
    setIsProcessing(true);
    
    const newTasks: Omit<ArticleTask, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const importWarnings: string[] = [];
    
    const siteNameMap = new Map(sites.map(site => [site.name.toLowerCase().trim(), site.id]));

    jsonData.forEach((row, index) => {
        const getValue = (key: string): string => {
            const headerName = columnMappings[key];
            return headerName ? String(row[headerName] ?? '').trim() : '';
        };
        
        // --- Blog Matching ---
        const blogName = getValue('blog');
        let blogId: string | undefined = undefined;

        if (blogName) {
            const lowerBlogName = blogName.toLowerCase().trim();
            blogId = siteNameMap.get(lowerBlogName);

            if (!blogId) {
                const bestMatch = sites.find(site => {
                    const lowerSiteName = site.name.toLowerCase().trim();
                    return lowerSiteName.includes(lowerBlogName) || lowerBlogName.includes(lowerSiteName);
                });
                if (bestMatch) blogId = bestMatch.id;
            }
        }

        if (blogName && !blogId) {
            importWarnings.push(`Row ${index + 2}: Blog '${blogName}' not found. Task imported without a site assignment.`);
        }
        
        // --- VA Assignment Logic ---
        let vaId: string | undefined = undefined;
        if (blogId) {
            const vasForBlog = vas.filter(v => v.siteIds.includes(blogId!));
            if (vasForBlog.length > 0) {
                // Distribute tasks among available VAs for that blog using modulo operator
                const vaIndex = newTasks.filter(t => t.blogId === blogId).length % vasForBlog.length;
                vaId = vasForBlog[vaIndex].id;
            } else {
                importWarnings.push(`Row ${index + 2}: Blog '${blogName}' found, but no VA is assigned to it. Task will be unassigned.`);
            }
        }

        const topTitleValue = getValue('topTitle') || 'Untitled';

        newTasks.push({
            link: getValue('link'),
            keywords: getValue('keywords').split(',').map(k => k.trim()).filter(Boolean),
            board: getValue('board'),
            annotatedInterests: getValue('annotatedInterests'),
            topTitle: topTitleValue,
            category: getValue('category') || 'Uncategorized',
            titleOptions: topTitleValue !== 'Untitled' ? [topTitleValue] : [],
            blogId: blogId,
            vaId: vaId,
            status: 'idea',
        });
    });

    if (newTasks.length > 0) {
        onImport(newTasks);
    }

    setImportResult({
        successCount: newTasks.length,
        errorCount: importWarnings.length,
        errors: importWarnings.slice(0, 100) // Limit displayed errors
    });
    setStep('result');
    setIsProcessing(false);
  };
  
  const renderUploadStep = () => (
    <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload File</label>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
            <p className="font-semibold">Instructions:</p>
            <ul className="list-disc list-inside">
                <li>File must be tab-separated (.tsv, .txt), comma-separated (.csv), or an Excel file (.xlsx, .xls).</li>
                <li>The first row must be a header row with column names.</li>
                <li>The value in your 'blog' column should match a connected site for automatic VA assignment.</li>
            </ul>
        </div>
        <div className="mt-2 flex items-center gap-4">
            <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-slate-700 py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <span>Choose file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv,.tsv,.txt,.xlsx,.xls" />
            </label>
            {file && <span className="text-sm text-slate-600 dark:text-slate-400">{file.name}</span>}
        </div>
        {isProcessing && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Analyzing file...</p>}
    </div>
  );
  
  const renderMappingStep = () => (
    <div>
      <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Confirm Column Mapping</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">We've automatically detected your columns. Please review and correct any mismatches.</p>
      <div className="space-y-3">
        {REQUIRED_FIELDS.map(field => {
          const mappedHeader = columnMappings[field.key];
          const hasError = mappedHeader === null;
          return (
            <div key={field.key} className="grid grid-cols-3 items-center gap-4">
              <label className={`text-sm font-medium ${hasError ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {field.name} {hasError && '*'}
              </label>
              <div className="col-span-2">
                <select 
                  value={mappedHeader ?? ''} 
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-white dark:bg-slate-700 dark:text-white ${hasError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                >
                  <option value="" disabled>Select a column...</option>
                  {fileHeaders.map((header) => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  const renderResultStep = () => (
    importResult && (
      <div className={`p-4 rounded-md border ${importResult.errorCount > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50'}`}>
          <p className={`font-semibold text-lg ${importResult.errorCount > 0 ? 'text-yellow-800 dark:text-yellow-200' : 'text-green-800 dark:text-green-200'}`}>
              Import Complete
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Successfully imported {importResult.successCount} tasks.
              {importResult.errorCount > 0 && ` Encountered ${importResult.errorCount} warnings.`}
          </p>
          {importResult.errors.length > 0 && (
              <ul className="mt-2 text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                  {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
          )}
      </div>
    )
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-75 dark:bg-black dark:bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity" onClick={resetAndClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Import Tasks from File</h3>
          <button type="button" onClick={resetAndClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {step === 'upload' && renderUploadStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'result' && renderResultStep()}
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
          <div>
            {step === 'mapping' && <button onClick={() => resetState()} className="text-sm text-slate-600 dark:text-slate-400 hover:underline">Start Over</button>}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetAndClose} className="py-2 px-4 bg-white dark:bg-slate-600 dark:hover:bg-slate-500 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                {step === 'result' ? "Close" : "Cancel"}
            </button>
            {step === 'mapping' && 
                <button type="button" onClick={handleImport} disabled={isProcessing} className="py-2 px-4 bg-primary border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                    {isProcessing ? 'Importing...' : `Import ${jsonData.length} Tasks`}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportTasksModal;
