import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Header from './components/Header.jsx';
import LeftSidebar from './components/LeftSidebar.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import RightPanel from './components/RightPanel.jsx';
import AddNodeModal from './components/AddNodeModal.jsx';
import AddLinkModal from './components/AddLinkModal.jsx';
import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [currentMode, setCurrentMode] = useState('create');
  const [activeFilters, setActiveFilters] = useState({
    nodeTypes: new Set(),
    relationshipTypes: new Set()
  });
  const [nodeIdCounter, setNodeIdCounter] = useState(0);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);

  // Load sample data on component mount
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleNodes = [
      {id: 'president', name: 'President', type: 'person', description: 'Head of State'},
      {id: 'prime-minister', name: 'Prime Minister', type: 'person', description: 'Head of Government'},
      {id: 'ministry-health', name: 'Ministry of Health', type: 'organization', description: 'Healthcare oversight'},
      {id: 'ministry-edu', name: 'Ministry of Education', type: 'organization', description: 'Education oversight'},
      {id: 'ministry-finance', name: 'Ministry of Finance', type: 'organization', description: 'Financial oversight'},
      {id: 'ministry-defense', name: 'Ministry of Defense', type: 'organization', description: 'Defense oversight'},
      {id: 'dept-public-health', name: 'Public Health Dept', type: 'department', description: 'Public health services'},
      {id: 'dept-hospitals', name: 'Hospital Management', type: 'department', description: 'Hospital administration'},
      {id: 'dept-schools', name: 'School Administration', type: 'department', description: 'School management'}
    ];
    
    const sampleLinks = [
      {source: 'president', target: 'ministry-health', type: 'oversees'},
      {source: 'president', target: 'ministry-edu', type: 'oversees'},
      {source: 'president', target: 'ministry-finance', type: 'oversees'},
      {source: 'president', target: 'ministry-defense', type: 'oversees'},
      {source: 'ministry-health', target: 'dept-public-health', type: 'manages'},
      {source: 'ministry-health', target: 'dept-hospitals', type: 'manages'},
      {source: 'ministry-edu', target: 'dept-schools', type: 'manages'}
    ];
    
    setNodes(sampleNodes);
    setLinks(sampleLinks);
    setNodeIdCounter(sampleNodes.length);
  };

  const switchToMode = (mode) => {
    setCurrentMode(mode);
    if (mode === 'create') {
      setActiveFilters({
        nodeTypes: new Set(),
        relationshipTypes: new Set()
      });
    }
  };

  const createNode = (nodeData) => {
    const newNode = {
      id: `node-${nodeIdCounter}`,
      ...nodeData
    };
    setNodes(prev => [...prev, newNode]);
    setNodeIdCounter(prev => prev + 1);
    setShowAddNodeModal(false);
  };

  const createLink = (linkData) => {
    // Check if link already exists
    const existingLink = links.find(link => 
      (link.source === linkData.source || link.source.id === linkData.source) && 
      (link.target === linkData.target || link.target.id === linkData.target)
    );
    
    if (existingLink) {
      alert('A relationship between these nodes already exists');
      return;
    }
    
    if (linkData.source === linkData.target) {
      alert('Source and target nodes cannot be the same');
      return;
    }
    
    setLinks(prev => [...prev, linkData]);
    setShowAddLinkModal(false);
  };

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setLinks(prev => prev.filter(l => 
      (l.source.id || l.source) !== nodeId && 
      (l.target.id || l.target) !== nodeId
    ));
    setSelectedNode(null);
  };

  const deleteLink = (linkIndex) => {
    setLinks(prev => prev.filter((_, index) => index !== linkIndex));
    setSelectedLink(null);
  };

  const selectNode = (node) => {
    setSelectedNode(node);
    setSelectedLink(null);
  };

  const selectLink = (link) => {
    setSelectedLink(link);
    setSelectedNode(null);
  };

  const getNodeConnections = (node) => {
    return links.filter(link => 
      link.source.id === node.id || link.target.id === node.id ||
      link.source === node.id || link.target === node.id
    ).length;
  };

  const getNodeColor = (type) => {
    const colors = {
      person: '#3B82F6',
      organization: '#10B981',
      department: '#F59E0B',
      project: '#8B5CF6',
      document: '#EF4444'
    };
    return colors[type] || '#6B7280';
  };

  const updateFilters = (filterType, value, checked) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (checked) {
        newFilters[filterType].add(value);
      } else {
        newFilters[filterType].delete(value);
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      nodeTypes: new Set(),
      relationshipTypes: new Set()
    });
  };

  return (
    <div className="bg-gray-900 text-white overflow-hidden h-screen flex flex-col">
      <Header 
        currentMode={currentMode}
        onModeChange={switchToMode}
        onAddNode={() => setShowAddNodeModal(true)}
        onAddLink={() => setShowAddLinkModal(true)}
        onSave={() => console.log('Save functionality')}
        onReset={() => {
          setSelectedNode(null);
          setSelectedLink(null);
        }}
      />
      
      <div className="flex flex-1">
        <LeftSidebar 
          currentMode={currentMode}
          nodes={nodes}
          links={links}
          activeFilters={activeFilters}
          onFilterChange={updateFilters}
          onClearFilters={clearAllFilters}
        />
        
        <GraphCanvas 
          nodes={nodes}
          links={links}
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          onNodeSelect={selectNode}
          onLinkSelect={selectLink}
          getNodeColor={getNodeColor}
          activeFilters={activeFilters}
          currentMode={currentMode}
        />
        
        <RightPanel 
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          onDeleteNode={deleteNode}
          onDeleteLink={deleteLink}
          getNodeConnections={getNodeConnections}
        />
      </div>

      {showAddNodeModal && (
        <AddNodeModal 
          onClose={() => setShowAddNodeModal(false)}
          onCreate={createNode}
        />
      )}

      {showAddLinkModal && (
        <AddLinkModal 
          nodes={nodes}
          onClose={() => setShowAddLinkModal(false)}
          onCreate={createLink}
        />
      )}
    </div>
  );
}

export default App;
