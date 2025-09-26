import React, { useState } from 'react';

const ColumnFilter = ({ columns, selectedColumns, onColumnsChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColumnToggle = (column) => {
    if (selectedColumns.includes(column)) {
      onColumnsChange(selectedColumns.filter(c => c !== column));
    } else {
      onColumnsChange([...selectedColumns, column]);
    }
  };

  const handleSelectAll = () => {
    onColumnsChange(columns);
  };

  const handleSelectNone = () => {
    onColumnsChange([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm hover:bg-gray-600"
      >
        <span>Columns ({selectedColumns.length}/{columns.length})</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-200">Select Columns</span>
              <div className="flex space-x-1">
                <button
                  onClick={handleSelectAll}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded"
                >
                  None
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {columns.map((column, index) => (
              <label
                key={index}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnToggle(column)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">{column}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnFilter;
