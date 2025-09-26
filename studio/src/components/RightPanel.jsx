import React from 'react';

const RightPanel = ({ 
  selectedNode, 
  selectedLink, 
  onDeleteNode, 
  onDeleteLink, 
  getNodeConnections,
  focusMode,
  focusedNodes,
  onAddToFocus,
  onRemoveFromFocus
}) => {
  const renderNodeProperties = (node) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">{node.name}</h3>
        <span className="inline-block px-2 py-1 bg-gray-700 text-xs rounded mt-1">
          {node.type}
        </span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <p className="text-sm text-gray-400">{node.description || 'No description'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Connections</label>
        <p className="text-sm text-gray-400">{getNodeConnections(node)} connections</p>
      </div>
      <div className="pt-4 border-t border-gray-700 space-y-2">
        {/* Focus controls available in both Create and Query modes */}
        {focusedNodes.has(node.id) ? (
          <button 
            onClick={() => onRemoveFromFocus(node.id)}
            className="w-full bg-orange-600 hover:bg-orange-700 py-2 rounded text-sm"
          >
            <i className="fa-solid fa-times mr-1"></i>
            Remove from Focus
          </button>
        ) : (
          <button 
            onClick={() => onAddToFocus(node)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded text-sm"
          >
            <i className="fa-solid fa-crosshairs mr-1"></i>
            Add to Focus
          </button>
        )}
        <button 
          onClick={() => onDeleteNode(node.id)}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-sm"
        >
          Delete Node
        </button>
      </div>
    </div>
  );

  const renderLinkProperties = (link) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Relationship</h3>
        <span className="inline-block px-2 py-1 bg-gray-700 text-xs rounded mt-1">
          {link.type.replace('_', ' ')}
        </span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Source</label>
        <p className="text-sm text-gray-400">
          {typeof link.source === 'object' ? link.source.name : link.source}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Target</label>
        <p className="text-sm text-gray-400">
          {typeof link.target === 'object' ? link.target.name : link.target}
        </p>
      </div>
      {link.description && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <p className="text-sm text-gray-400">{link.description}</p>
        </div>
      )}
      <div className="pt-4 border-t border-gray-700">
        <button 
          onClick={() => onDeleteLink(link)}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-sm"
        >
          Delete Relationship
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center text-gray-400 mt-8">
      {focusMode ? (
        <>
          <i className="fa-solid fa-crosshairs text-3xl mb-3 text-yellow-400"></i>
          <p className="text-yellow-400 font-medium">Focus Mode Active</p>
          <p className="text-sm mt-2">Focusing on {focusedNodes.size} node{focusedNodes.size !== 1 ? 's' : ''}</p>
          <p className="text-xs mt-1">Only closely related entities are visible</p>
        </>
      ) : (
        <>
          <i className="fa-solid fa-mouse-pointer text-3xl mb-3"></i>
          <p>Select a node or connection to view properties</p>
        </>
      )}
    </div>
  );

  return (
    <aside className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Properties</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {selectedNode && renderNodeProperties(selectedNode)}
        {selectedLink && renderLinkProperties(selectedLink)}
        {!selectedNode && !selectedLink && renderEmptyState()}
      </div>
    </aside>
  );
};

export default RightPanel;
