import React from 'react';

const DataViewer = ({ nodeData, selectedNode, nodes, links }) => {
  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-gray-400">
        <i className="fa-solid fa-database text-4xl mb-4"></i>
        <p>Select a node to view its data</p>
      </div>
    );
  }

  // Find attributes connected to the selected node
  const getNodeAttributes = (nodeId) => {
    if (!links || !nodes) return [];
    
    return links
      .filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        return sourceId === nodeId && link.type === 'IS_ATTRIBUTE';
      })
      .map(link => {
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return nodes.find(n => n.id === targetId);
      })
      .filter(Boolean);
  };

  const attributes = getNodeAttributes(selectedNode.id);

  const renderSimpleData = (data) => {
    if (typeof data === 'object' && data !== null) {
      return (
        <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }
    return <span className="text-gray-300">{String(data)}</span>;
  };

  const renderTable = (data) => {
    if (!data.columns || !data.rows) {
      return renderSimpleData(data);
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-700">
              {data.columns.map((column, index) => (
                <th key={index} className="border border-gray-600 px-2 py-1 text-left text-gray-200">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-700/50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-600 px-2 py-1 text-gray-300">
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-2">Data Viewer</h2>
        <div className="text-sm text-gray-400">
          <strong>{selectedNode.name}</strong> - {selectedNode.type}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {attributes.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <i className="fa-solid fa-info-circle text-2xl mb-2"></i>
            <p>No data attributes found for this node</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {attributes.map((attribute, index) => {
              const data = nodeData[attribute.id];
              if (!data) return null;
              
              return (
                <div key={`attr-${attribute.id}-${index}`} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-white">{attribute.name}</h3>
                    <span className="px-2 py-1 bg-blue-600 text-xs rounded-full">
                      {data.type}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-3">
                    {attribute.description}
                  </div>
                  
                  <div className="bg-gray-900 rounded p-3">
                    {data.type === 'table' ? (
                      renderTable(data.data)
                    ) : (
                      renderSimpleData(data.data)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataViewer;