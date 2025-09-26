import React, { useState } from 'react';
import DataViewer from './DataViewer.jsx';
import RightPanel from './RightPanel.jsx';
import AggregationPanel from './AggregationPanel.jsx';

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
  const [showAggregation, setShowAggregation] = useState(false);

  const tabs = [
    { id: 'properties', label: 'Properties', icon: '⚙️', tooltip: 'Node Properties' },
    { id: 'data', label: 'Data', icon: '📊', tooltip: 'Data & Aggregation' },
    { id: 'connections', label: 'Connections', icon: '🔗', tooltip: 'Node Connections' }
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
    <div className="h-full flex">
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
      
      {/* Vertical Tab Navigation - Rightmost */}
      <div className="w-12 bg-gray-800 border-l border-gray-700 flex flex-col">
        {tabs.map((tab) => (
          <div key={tab.id} className="relative group">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`w-full h-12 flex items-center justify-center text-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-gray-700 border-l-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              }`}
              title={tab.tooltip}
            >
              {tab.icon}
            </button>
            
            {/* Tooltip - Positioned to the left */}
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              {tab.tooltip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabPanel;
