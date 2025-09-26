import React from 'react';

const LeftSidebar = ({ 
  currentMode, 
  nodes, 
  links, 
  activeFilters, 
  onFilterChange, 
  onClearFilters,
  searchQuery,
  filteredNodes
}) => {
  const nodeTypes = [...new Set(nodes.map(n => n.type))];
  const relationshipTypes = [...new Set(links.map(l => l.type))];

  const getNodeTypeCount = (type) => {
    return nodes.filter(n => n.type === type).length;
  };

  const getRelationshipTypeCount = (type) => {
    return links.filter(l => l.type === type).length;
  };

  const getVisibleNodes = () => {
    if (searchQuery.trim()) {
      return filteredNodes.length;
    }
    if (currentMode === 'create' || activeFilters.nodeTypes.size === 0) {
      return nodes.length;
    }
    return nodes.filter(n => activeFilters.nodeTypes.has(n.type)).length;
  };

  const getVisibleLinks = () => {
    if (searchQuery.trim()) {
      const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
      return links.filter(l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
      }).length;
    }
    if (currentMode === 'create' || activeFilters.nodeTypes.size === 0) {
      return links.length;
    }
    return links.filter(l => {
      const sourceType = typeof l.source === 'object' ? l.source.type : nodes.find(n => n.id === l.source)?.type;
      const targetType = typeof l.target === 'object' ? l.target.type : nodes.find(n => n.id === l.target)?.type;
      return activeFilters.nodeTypes.has(sourceType) && activeFilters.nodeTypes.has(targetType);
    }).length;
  };

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {currentMode === 'create' ? (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-3">Node Explorer</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Total Nodes</span>
                <span className="text-blue-400 font-medium">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Connections</span>
                <span className="text-green-400 font-medium">{links.length}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Node Types</h3>
              <div className="space-y-1">
                {nodeTypes.map(type => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 capitalize">{type}</span>
                    <span className="text-gray-500">({getNodeTypeCount(type)})</span>
                  </div>
                ))}
              </div>
            </div>
            
            {searchQuery.trim() ? (
              <div className="p-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Search Results</h3>
                <div className="space-y-1">
                  {filteredNodes.map(node => (
                    <div key={node.id} className="text-sm text-gray-300 truncate">
                      {node.name}
                    </div>
                  ))}
                  {filteredNodes.length === 0 && (
                    <div className="text-sm text-gray-500">No nodes found</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Recent Nodes</h3>
                <div className="space-y-1">
                  {nodes.slice(-5).map(node => (
                    <div key={node.id} className="text-sm text-gray-300 truncate">
                      {node.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold mb-3">Query Filters</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Filter by Node Type</h3>
              <div className="space-y-2">
                {nodeTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                      checked={activeFilters.nodeTypes.has(type)}
                      onChange={(e) => onFilterChange('nodeTypes', type, e.target.checked)}
                    />
                    <span className="text-gray-300 capitalize">{type}</span>
                    <span className="text-xs text-gray-500">({getNodeTypeCount(type)})</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Filter by Relationship</h3>
              <div className="space-y-2">
                {relationshipTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-600 bg-gray-700 text-blue-600"
                      checked={activeFilters.relationshipTypes.has(type)}
                      onChange={(e) => onFilterChange('relationshipTypes', type, e.target.checked)}
                    />
                    <span className="text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-500">({getRelationshipTypeCount(type)})</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <button 
                onClick={onClearFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded text-sm"
              >
                Clear All Filters
              </button>
            </div>
            
            <div className="p-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Query Results</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Visible Nodes</span>
                  <span className="text-blue-400">{getVisibleNodes()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Visible Links</span>
                  <span className="text-green-400">{getVisibleLinks()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default LeftSidebar;
