import React, { useState, useEffect } from 'react';

const DataViewer = ({ selectedNode, nodes, links }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedNode) {
      setData(null);
      return;
    }

    // If the selected node is an attribute itself, show its data
    if (selectedNode.type === 'document' || selectedNode.type === 'table') {
      loadAttributeData(selectedNode.id);
      return;
    }

    // If the selected node has attributes, show the first one's data
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
      loadAttributeData(attributes[0].id);
    } else {
      setData(null);
    }
  }, [selectedNode, nodes, links]);

  const loadAttributeData = async (attributeId) => {
    setLoading(true);
    try {
      // Map attribute IDs to JSON file paths
      const dataMap = {
        'president-profile': '/src/data/president-profile.json',
        'health-budget': '/src/data/health-budget.json',
        'education-stats': '/src/data/education-stats.json',
        'ministry-structure': '/src/data/ministry-structure.json',
        'hospital-data': '/src/data/hospital-data.json'
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-2">Data Viewer</h2>
        <div className="text-sm text-gray-400">
          {selectedNode.name} - {selectedNode.type}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-white mb-2">Data Content</h3>
            <div className="text-sm text-gray-400">
              {data.type ? `Type: ${data.type}` : 'Document data'}
            </div>
          </div>
          
          <div className="bg-gray-900 rounded p-3">
            {data.type === 'table' && data.columns && data.rows ? (
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
            ) : data.type === 'error' ? (
              <div className="text-red-400 text-center">
                <div className="text-2xl mb-2">❌</div>
                <p>Error: {data.message}</p>
              </div>
            ) : data.type === 'info' ? (
              <div className="text-blue-400 text-center">
                <div className="text-2xl mb-2">ℹ️</div>
                <p>{data.message}</p>
              </div>
            ) : (
              <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataViewer;