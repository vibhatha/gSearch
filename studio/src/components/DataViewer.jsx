import React, { useState, useEffect } from 'react';
import ColumnFilter from './ColumnFilter.jsx';
import DataModal from './DataModal.jsx';
import SimpleAggregation from './SimpleAggregation.jsx';

const DataViewer = ({ selectedNode, nodes, links }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [showAggregation, setShowAggregation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!selectedNode) {
      setData(null);
      setSelectedAttribute(null);
      return;
    }

    // If the selected node is an attribute itself, show its data
    if (selectedNode.type === 'document' || selectedNode.type === 'table') {
      loadAttributeData(selectedNode.id);
      setSelectedAttribute(selectedNode);
      return;
    }

    // If the selected node has attributes, show the attribute list
    const getAttributes = () => {
      if (!links || !nodes) return [];
      
      const attributeIds = [];
      for (const link of links) {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        if (sourceId === selectedNode.id && link.type === 'IS_ATTRIBUTE') {
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          attributeIds.push(targetId);
        }
      }
      
      return attributeIds.map(id => nodes.find(n => n.id === id)).filter(Boolean);
    };

    const attributes = getAttributes();
    console.log('DataViewer: Found attributes for', selectedNode.name, ':', attributes);
    if (attributes.length > 0) {
      setData({ attributes });
      setSelectedAttribute(null);
    } else {
      setData(null);
      setSelectedAttribute(null);
    }
  }, [selectedNode, nodes, links]);

  const loadAttributeData = async (attributeId) => {
    setLoading(true);
    try {
        const dataMap = {
          'president-profile': '/src/data/president-profile.json',
          'health-budget': '/src/data/health-budget.json',
          'education-stats': '/src/data/education-stats.json',
          'ministry-structure': '/src/data/ministry-structure.json',
          'hospital-data': '/src/data/hospital-data.json',
          'education-budget': '/src/data/education-budget.json',
          'defense-budget': '/src/data/defense-budget.json'
        };

      const filePath = dataMap[attributeId];
      if (!filePath) {
        setData({ type: 'info', message: 'No data file available for this attribute' });
        return;
      }

      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      setData({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeClick = (attribute) => {
    setSelectedAttribute(attribute);
    setCurrentPage(1);
    setSelectedColumns([]);
    setSearchTerm('');
    loadAttributeData(attribute.id);
  };

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const getFilteredData = () => {
    if (!data || !data.columns || !data.rows) return { columns: [], rows: [] };
    
    let filteredColumns = selectedColumns.length > 0 ? selectedColumns : data.columns;
    let filteredRows = data.rows;

    // Apply search filter
    if (searchTerm) {
      filteredRows = data.rows.filter(row => 
        row.some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
      );
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

  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="text-4xl mb-4">📊</div>
        <p>Select a node to view its data</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="text-2xl mb-2">⏳</div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="text-2xl mb-2">ℹ️</div>
        <p>No data available for this node</p>
      </div>
    );
  }

  // Show attribute list if node has multiple attributes
  if (data.attributes && data.attributes.length > 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Data Attributes</h2>
          <div className="text-sm text-gray-400">
            {selectedNode.name} has {data.attributes.length} data attribute{data.attributes.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {data.attributes.map((attr, index) => (
              <div 
                key={attr.id}
                onClick={() => handleAttributeClick(attr)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedAttribute && selectedAttribute.id === attr.id
                    ? 'bg-blue-900/20 border-blue-500 text-blue-300'
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{attr.name}</h3>
                    <p className="text-sm text-gray-400">{attr.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      attr.type === 'table' ? 'bg-cyan-600' : 'bg-red-600'
                    }`}>
                      {attr.type}
                    </span>
                    <div className="text-gray-400">→</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show data content for selected attribute
  return (
    <div className="h-full flex flex-col">
      <div className={`p-4 border-b ${showAggregation ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700'}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            {showAggregation ? '🧮 Aggregation Mode' : 'Data Viewer'}
          </h2>
          {selectedAttribute && (
            <button 
              onClick={() => {
                setSelectedAttribute(null);
                // Reset to show attribute list
                const getAttributes = () => {
                  if (!links || !nodes) return [];
                  
                  const attributeIds = [];
                  for (const link of links) {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    if (sourceId === selectedNode.id && link.type === 'IS_ATTRIBUTE') {
                      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                      attributeIds.push(targetId);
                    }
                  }
                  
                  return attributeIds.map(id => nodes.find(n => n.id === id)).filter(Boolean);
                };
                
                const attributes = getAttributes();
                if (attributes.length > 0) {
                  setData({ attributes });
                }
              }}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              ← Back to attributes
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedAttribute ? selectedAttribute.name : selectedNode.name} - {selectedNode.type}
          </div>
          {!selectedAttribute && data && data.attributes && data.attributes.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {data.attributes.length} attribute{data.attributes.length !== 1 ? 's' : ''}
              </span>
              <button 
                onClick={() => {
                  console.log('Aggregation button clicked, current state:', showAggregation);
                  setShowAggregation(!showAggregation);
                }}
                className={`text-sm px-3 py-2 rounded font-medium ${
                  data.attributes.length > 1 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
                title={data.attributes.length > 1 ? 'Aggregate multiple attributes' : 'Only one attribute available'}
              >
                🧮 {showAggregation ? 'Hide Aggregation' : 'Show Aggregation'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {showAggregation && !selectedAttribute ? (
          <div className="flex-1 overflow-y-auto">
            {console.log('Rendering SimpleAggregation, showAggregation:', showAggregation, 'selectedAttribute:', selectedAttribute)}
            <SimpleAggregation 
              selectedNode={selectedNode}
              nodes={nodes}
              links={links}
              onClose={() => setShowAggregation(false)}
            />
          </div>
        ) : data && data.attributes ? (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-lg font-semibold mb-4">Available Attributes</h3>
            <div className="space-y-2">
              {data.attributes.map((attr, index) => (
                <div 
                  key={attr.id}
                  onClick={() => loadAttributeData(attr.id)}
                  className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{attr.name}</h4>
                      <p className="text-sm text-gray-400">{attr.description}</p>
                      <span className="text-xs text-gray-500 capitalize">{attr.type}</span>
                    </div>
                    <div className="text-gray-400">
                      {attr.type === 'table' ? '📊' : '📄'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : data && data.type === 'table' && data.columns && data.rows ? (
          <div className="flex-1 flex flex-col">
            {/* Table Controls */}
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
                
                {/* Maximize Button */}
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  <span>🔍</span>
                  <span>Maximize</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-700">
                        {getPaginatedData().columns.map((column, index) => (
                          <th key={index} className="border border-gray-600 px-3 py-2 text-left text-gray-200 font-medium">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData().rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-700/50">
                          {getPaginatedData().columns.map((column, cellIndex) => {
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
              {getPaginatedData().totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, getPaginatedData().totalRows)} of {getPaginatedData().totalRows} rows
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-400">
                      Page {currentPage} of {getPaginatedData().totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(getPaginatedData().totalPages, prev + 1))}
                      disabled={currentPage === getPaginatedData().totalPages}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : data.type === 'error' ? (
          <div className="p-4 text-center text-red-400">
            <div className="text-2xl mb-2">❌</div>
            <p>Error: {data.message}</p>
          </div>
        ) : data.type === 'info' ? (
          <div className="p-4 text-center text-blue-400">
            <div className="text-2xl mb-2">ℹ️</div>
            <p>{data.message}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Data Modal */}
      <DataModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={data}
        attributeName={selectedAttribute?.name || selectedNode?.name}
      />
    </div>
  );
};

export default DataViewer;