import React, { useState, useEffect } from 'react';

const SimpleAggregation = ({ selectedNode, nodes, links, onClose }) => {
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [allData, setAllData] = useState([]);
  const [groupByColumn, setGroupByColumn] = useState('');
  const [aggregationConfigs, setAggregationConfigs] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      // Find all attributes for the selected node
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
      setAvailableAttributes(attributes);
    }
  }, [selectedNode, nodes, links]);

  const loadAttributeData = async (attributeId) => {
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
    if (!filePath) return null;

    try {
      const response = await fetch(filePath);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  };

  const addAggregationConfig = () => {
    setAggregationConfigs([...aggregationConfigs, { column: '', operation: 'sum' }]);
  };

  const updateAggregationConfig = (index, field, value) => {
    const newConfigs = [...aggregationConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setAggregationConfigs(newConfigs);
  };

  const removeAggregationConfig = (index) => {
    setAggregationConfigs(aggregationConfigs.filter((_, i) => i !== index));
  };

  const getAvailableColumns = () => {
    if (allData.length === 0) return [];
    if (!Array.isArray(allData[0])) return [];
    return allData[0].slice(0, -2); // Exclude _source and _sourceId
  };

  const performAggregation = async () => {
    if (allData.length === 0 || !groupByColumn || aggregationConfigs.length === 0) {
      setResults({ type: 'error', message: 'Please select data, group by column, and at least one aggregation' });
      return;
    }

    setLoading(true);
    try {
      const groupByIndex = getAvailableColumns().indexOf(groupByColumn);
      if (groupByIndex === -1) {
        setResults({ type: 'error', message: 'Group by column not found in data' });
        return;
      }

      // Group data by the selected column
      const groups = {};
      allData.forEach(row => {
        const groupKey = row[groupByIndex];
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(row);
      });

      const results = [];
      Object.entries(groups).forEach(([group, rows]) => {
        const resultRow = [group];
        
        aggregationConfigs.forEach(config => {
          const columnIndex = getAvailableColumns().indexOf(config.column);
          if (columnIndex === -1) return;
          
          const values = rows.map(row => parseFloat(row[columnIndex]) || 0);
          let result;
          
          switch (config.operation) {
            case 'sum':
              result = values.reduce((sum, val) => sum + val, 0);
              break;
            case 'avg':
              result = values.reduce((sum, val) => sum + val, 0) / values.length;
              break;
            case 'max':
              result = Math.max(...values);
              break;
            case 'min':
              result = Math.min(...values);
              break;
            case 'count':
              result = values.length;
              break;
            default:
              result = values.reduce((sum, val) => sum + val, 0);
          }
          
          resultRow.push(result.toFixed(2));
        });
        
        results.push(resultRow);
      });

      setResults({ 
        type: 'success', 
        data: results.sort((a, b) => a[0] - b[0]), 
        totalRows: allData.length,
        groupByColumn,
        aggregationConfigs
      });
    } catch (error) {
      setResults({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const performCalculation = (data, aggType) => {
    const groups = {};
    
    // Group data by year (first column)
    data.forEach(row => {
      const year = row[0];
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(row);
    });

    const results = [];
    
    Object.entries(groups).forEach(([year, rows]) => {
      const numericColumns = [];
      
      // Find numeric columns (skip first column which is year)
      for (let i = 1; i < rows[0].length; i++) {
        if (typeof rows[0][i] === 'number' || !isNaN(parseFloat(rows[0][i]))) {
          numericColumns.push(i);
        }
      }

      const aggregatedRow = [year];
      
      numericColumns.forEach(colIndex => {
        const values = rows.map(row => parseFloat(row[colIndex]) || 0);
        let result;
        
        switch (aggType) {
          case 'sum':
            result = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'avg':
            result = values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case 'max':
            result = Math.max(...values);
            break;
          case 'min':
            result = Math.min(...values);
            break;
          case 'count':
            result = values.length;
            break;
          default:
            result = values.reduce((sum, val) => sum + val, 0);
        }
        
        aggregatedRow.push(result.toFixed(2));
      });
      
      results.push(aggregatedRow);
    });

    return results.sort((a, b) => a[0] - b[0]); // Sort by year
  };

  const handleAttributeToggle = async (attribute) => {
    if (selectedAttributes.find(attr => attr.id === attribute.id)) {
      const newSelected = selectedAttributes.filter(attr => attr.id !== attribute.id);
      setSelectedAttributes(newSelected);
      await loadAllData(newSelected);
    } else {
      const newSelected = [...selectedAttributes, attribute];
      setSelectedAttributes(newSelected);
      await loadAllData(newSelected);
    }
  };

  const loadAllData = async (attributes) => {
    if (attributes.length === 0) {
      setAllData([]);
      return;
    }

    setLoading(true);
    try {
      const dataPromises = attributes.map(attr => loadAttributeData(attr.id));
      const dataResults = await Promise.all(dataPromises);
      
      const combinedData = [];
      dataResults.forEach((data, index) => {
        if (data && data.type === 'table' && data.rows) {
          // Add source attribute info to each row
          const enrichedRows = data.rows.map(row => {
            if (Array.isArray(row)) {
              return [...row, attributes[index].name, attributes[index].id];
            }
            return row;
          });
          combinedData.push(...enrichedRows);
        }
      });
      
      console.log('Combined data structure:', combinedData);
      setAllData(combinedData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedNode) {
    return (
      <div className="p-4 text-gray-400">
        <p>Select a node to perform aggregations on its attributes.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Aggregation</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {selectedNode.name} - {selectedNode.type}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Attribute Selection */}
        <div>
          <h3 className="text-md font-medium mb-3">Select Attributes</h3>
          <div className="space-y-2">
            {availableAttributes.map(attr => (
              <label key={attr.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedAttributes.find(a => a.id === attr.id) !== undefined}
                  onChange={() => handleAttributeToggle(attr)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600"
                />
                <span className="text-gray-300">{attr.name}</span>
                <span className="text-gray-500">({attr.type})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        {allData.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            Loaded {allData.length} rows | Columns: {getAvailableColumns().length}
          </div>
        )}

        {/* Group By Selection */}
        {allData.length > 0 && (
          <div>
            <h3 className="text-md font-medium mb-3">Group By</h3>
            <select
              value={groupByColumn}
              onChange={(e) => setGroupByColumn(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
            >
              <option value="">Select column to group by...</option>
              {getAvailableColumns().map((column, index) => (
                <option key={index} value={column}>{column}</option>
              ))}
            </select>
          </div>
        )}

        {/* Aggregation Configurations */}
        {allData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium">Aggregations</h3>
              <button
                onClick={addAggregationConfig}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
              >
                + Add Aggregation
              </button>
            </div>
            <div className="space-y-2">
              {aggregationConfigs.map((config, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800 rounded">
                  <select
                    value={config.column}
                    onChange={(e) => updateAggregationConfig(index, 'column', e.target.value)}
                    className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  >
                    <option value="">Select column...</option>
                    {getAvailableColumns().map((column, colIndex) => (
                      <option key={colIndex} value={column}>{column}</option>
                    ))}
                  </select>
                  <select
                    value={config.operation}
                    onChange={(e) => updateAggregationConfig(index, 'operation', e.target.value)}
                    className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  >
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="max">Maximum</option>
                    <option value="min">Minimum</option>
                    <option value="count">Count</option>
                  </select>
                  <button
                    onClick={() => removeAggregationConfig(index)}
                    className="text-red-400 hover:text-red-300 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execute Button */}
        <button
          onClick={performAggregation}
          disabled={allData.length === 0 || !groupByColumn || aggregationConfigs.length === 0 || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 rounded text-sm font-medium"
        >
          {loading ? 'Calculating...' : 'Perform Aggregation'}
        </button>

        {/* Results */}
        {results && (
          <div>
            <h3 className="text-md font-medium mb-3">Results</h3>
            {results.type === 'error' ? (
              <div className="text-red-400 text-sm">{results.message}</div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
                <div className="text-sm text-gray-400 mb-2">
                  Total rows processed: {results.totalRows} | Grouped by: {results.groupByColumn}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 px-3 text-gray-300">{results.groupByColumn}</th>
                        {results.aggregationConfigs.map((config, index) => (
                          <th key={index} className="text-left py-2 px-3 text-gray-300">
                            {config.operation.toUpperCase()}({config.column})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.data.map((row, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-2 px-3 text-gray-300">{row[0]}</td>
                          {row.slice(1).map((cell, cellIndex) => (
                            <td key={cellIndex} className="py-2 px-3 text-gray-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAggregation;
