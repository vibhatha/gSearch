import React, { useState, useEffect } from 'react';
import ColumnFilter from './ColumnFilter.jsx';

const DataModal = ({ isOpen, onClose, data, attributeName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    if (data && data.columns) {
      setSelectedColumns(data.columns);
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const getFilteredData = () => {
    if (!data.columns || !data.rows) return { columns: [], rows: [] };
    
    let filteredColumns = selectedColumns.length > 0 ? selectedColumns : data.columns;
    let filteredRows = data.rows;

    // Apply search filter
    if (searchTerm) {
      filteredRows = data.rows.filter(row => 
        row.some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    if (sortColumn) {
      const columnIndex = data.columns.indexOf(sortColumn);
      filteredRows = [...filteredRows].sort((a, b) => {
        const aVal = a[columnIndex];
        const bVal = b[columnIndex];
        
        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });
    }

    return { columns: filteredColumns, rows: filteredRows };
  };

  const getPaginatedData = () => {
    const { columns, rows } = getFilteredData();
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    return {
      columns,
      rows: rows.slice(startIndex, endIndex),
      totalRows: rows.length,
      totalPages: Math.ceil(rows.length / rowsPerPage)
    };
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const exportData = () => {
    const { columns, rows } = getFilteredData();
    
    if (exportFormat === 'csv') {
      const csvContent = [
        columns.join(','),
        ...rows.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${attributeName || 'data'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'json') {
      const jsonData = {
        columns,
        rows,
        metadata: {
          totalRows: rows.length,
          exportedAt: new Date().toISOString(),
          attributeName
        }
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${attributeName || 'data'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const paginatedData = getPaginatedData();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-[95vw] h-[90vh] bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-white">{attributeName}</h2>
            <p className="text-sm text-gray-400">
              {paginatedData.totalRows} rows • {paginatedData.columns.length} columns
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="text-gray-400 text-xl">×</span>
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              />
            </div>
            
            {/* Column Filter */}
            <ColumnFilter
              columns={data.columns || []}
              selectedColumns={selectedColumns}
              onColumnsChange={setSelectedColumns}
            />
            
            {/* Rows per page */}
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
            
            {/* Export */}
            <div className="flex items-center space-x-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-700">
                    {paginatedData.columns.map((column, index) => (
                      <th 
                        key={index} 
                        className="border border-gray-600 px-3 py-2 text-left text-gray-200 font-medium cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column}</span>
                          {sortColumn === column && (
                            <span className="text-blue-400">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-700/50">
                      {paginatedData.columns.map((column, cellIndex) => {
                        const originalIndex = data.columns.indexOf(column);
                        return (
                          <td key={cellIndex} className="border border-gray-600 px-3 py-2 text-gray-300">
                            {String(row[originalIndex])}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {paginatedData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, paginatedData.totalRows)} of {paginatedData.totalRows} rows
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {paginatedData.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(paginatedData.totalPages, prev + 1))}
                  disabled={currentPage === paginatedData.totalPages}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(paginatedData.totalPages)}
                  disabled={currentPage === paginatedData.totalPages}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataModal;
