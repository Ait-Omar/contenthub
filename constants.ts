import { Status } from './types';

export const STATUS_OPTIONS: { value: Status; label: string; color: string, ringColor: string }[] = [
  { value: 'idea', label: 'Idea', color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200', ringColor: 'focus:ring-slate-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', ringColor: 'focus:ring-blue-500' },
  { value: 'review', label: 'In Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200', ringColor: 'focus:ring-yellow-500' },
  { value: 'changes-requested', label: 'Changes Requested', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200', ringColor: 'focus:ring-purple-500' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200', ringColor: 'focus:ring-green-500' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', ringColor: 'focus:ring-red-500' },
];