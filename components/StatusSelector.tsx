
import React from 'react';
import { Status } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface StatusSelectorProps {
  currentStatus: Status;
  onChange: (newStatus: Status) => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onChange }) => {
  const currentOption = STATUS_OPTIONS.find(opt => opt.value === currentStatus);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as Status);
  };

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={handleChange}
        className={`w-full appearance-none pl-3 pr-8 py-1.5 text-sm font-medium border-none rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${currentOption?.color} ${currentOption?.ringColor}`}
      >
        {STATUS_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

export default StatusSelector;