import React, { useState } from 'react';
import DataViewer from './DataViewer.jsx';
import RightPanel from './RightPanel.jsx';

const TabPanel = ({ 
  selectedNode, 
  selectedLink, 
  nodes, 
  links, 
  onDeleteNode, 
  onDeleteLink, 
  getNodeConnections,
  focusMode,
  focusedNodes,
  onAddToFocus,
  onRemoveFromFocus
}) => {
  const [activeTab, setActiveTab] = useState('properties');

  const tabs = [
    { id: 'properties', label: 'Properties', icon: '⚙️' },
    { id: 'data', label: 'Data', icon: '📊' },
    { id: 'connections', label: 'Connections', icon: '🔗' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'properties':
        return (
          <RightPanel 
            selectedNode={selectedNode}
            selectedLink={selectedLink}
            onDeleteNode={onDeleteNode}
            onDeleteLink={onDeleteLink}
            getNodeConnections={getNodeConnections}
            focusMode={focusMode}
            focusedNodes={focusedNodes}
            onAddToFocus={onAddToFocus}
            onRemoveFromFocus={onRemoveFromFocus}
          />
        );
      
      case 'data':
        return (
          <DataViewer 
            selectedNode={selectedNode}
            nodes={nodes}
            links={links}
          />
        );
      
      case 'connections':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Node Connections</h3>
            {selectedNode ? (
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">Direct Connections</h4>
                  <div className="text-sm text-gray-300">
                    {getNodeConnections(selectedNode)} connections
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">Node Type</h4>
                  <div className="text-sm text-gray-300 capitalize">
                    {selectedNode.type}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">Node ID</h4>
                  <div className="text-sm text-gray-300 font-mono">
                    {selectedNode.id}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-2xl mb-2">🔗</div>
                <p>Select a node to view connections</p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabPanel;
