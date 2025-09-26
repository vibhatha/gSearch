import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Header from './components/Header.jsx';
import LeftSidebar from './components/LeftSidebar.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import RightPanel from './components/RightPanel.jsx';
import DataViewer from './components/DataViewer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [focusedNodes, setFocusedNodes] = useState(new Set()); // Track multiple focused nodes
  const [nodeIdCounter, setNodeIdCounter] = useState(0);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [nodeData, setNodeData] = useState({});

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
      {id: 'dept-schools', name: 'School Administration', type: 'department', description: 'School management'},
      // Attribute nodes
      {id: 'president-profile', name: 'President Profile', type: 'document', description: 'Personal and professional profile'},
      {id: 'health-budget', name: 'Health Budget', type: 'table', description: 'Annual health department budget'},
      {id: 'education-stats', name: 'Education Statistics', type: 'table', description: 'School enrollment and performance data'},
      {id: 'ministry-structure', name: 'Ministry Structure', type: 'document', description: 'Organizational structure document'},
      {id: 'hospital-data', name: 'Hospital Data', type: 'table', description: 'Hospital capacity and patient statistics'}
    ];
    
    const sampleLinks = [
      {source: 'president', target: 'ministry-health', type: 'oversees'},
      {source: 'president', target: 'ministry-edu', type: 'oversees'},
      {source: 'president', target: 'ministry-finance', type: 'oversees'},
      {source: 'president', target: 'ministry-defense', type: 'oversees'},
      {source: 'ministry-health', target: 'dept-public-health', type: 'manages'},
      {source: 'ministry-health', target: 'dept-hospitals', type: 'manages'},
      {source: 'ministry-edu', target: 'dept-schools', type: 'manages'},
      {source: 'prime-minister', target: 'ministry-health', type: 'reports_to'},
      {source: 'prime-minister', target: 'ministry-edu', type: 'reports_to'},
      {source: 'prime-minister', target: 'ministry-finance', type: 'reports_to'},
      {source: 'prime-minister', target: 'ministry-defense', type: 'reports_to'},
      // IS_ATTRIBUTE relationships
      {source: 'president', target: 'president-profile', type: 'IS_ATTRIBUTE'},
      {source: 'ministry-health', target: 'health-budget', type: 'IS_ATTRIBUTE'},
      {source: 'ministry-edu', target: 'education-stats', type: 'IS_ATTRIBUTE'},
      {source: 'ministry-health', target: 'ministry-structure', type: 'IS_ATTRIBUTE'},
      {source: 'dept-hospitals', target: 'hospital-data', type: 'IS_ATTRIBUTE'}
    ];
    
    // Sample data content for attributes
    const sampleData = {
      'president-profile': {
        type: 'document',
        data: {
          name: 'John Smith',
          age: 55,
          party: 'Democratic Party',
          term_start: '2020-01-20',
          term_end: '2024-01-20',
          education: {
            degree: 'PhD in Political Science',
            university: 'Harvard University',
            year: 1990
          },
          previous_positions: [
            'Governor of California (2010-2018)',
            'Senator (2004-2010)',
            'Mayor of San Francisco (1998-2004)'
          ],
          family: {
            spouse: 'Jane Smith',
            children: 2
          }
        }
      },
      'health-budget': {
        type: 'table',
        data: {
          columns: ['Year', 'Department', 'Budget (Million $)', 'Allocated', 'Spent', 'Remaining'],
          rows: [
            ['2023', 'Public Health', 150, 120, 115, 5],
            ['2023', 'Hospital Management', 200, 180, 175, 5],
            ['2023', 'Emergency Services', 75, 70, 68, 2],
            ['2022', 'Public Health', 140, 135, 130, 5],
            ['2022', 'Hospital Management', 190, 185, 180, 5],
            ['2022', 'Emergency Services', 70, 65, 63, 2]
          ]
        }
      },
      'education-stats': {
        type: 'table',
        data: {
          columns: ['District', 'Schools', 'Students', 'Teachers', 'Graduation Rate (%)', 'Test Scores (Avg)'],
          rows: [
            ['North District', 15, 4500, 300, 92, 85],
            ['South District', 12, 3800, 250, 88, 82],
            ['East District', 18, 5200, 350, 90, 87],
            ['West District', 10, 3200, 200, 85, 80],
            ['Central District', 20, 6000, 400, 95, 90]
          ]
        }
      },
      'ministry-structure': {
        type: 'document',
        data: {
          ministry_name: 'Ministry of Health',
          established: '1950',
          headquarters: 'Washington DC',
          departments: [
            {
              name: 'Public Health Department',
              director: 'Dr. Sarah Johnson',
              employees: 150,
              responsibilities: ['Disease prevention', 'Health education', 'Vaccination programs']
            },
            {
              name: 'Hospital Management',
              director: 'Dr. Michael Brown',
              employees: 200,
              responsibilities: ['Hospital operations', 'Patient care', 'Medical equipment']
            },
            {
              name: 'Emergency Services',
              director: 'Dr. Emily Davis',
              employees: 100,
              responsibilities: ['Emergency response', 'Disaster management', 'Crisis coordination']
            }
          ],
          budget: {
            total: 500000000,
            currency: 'USD',
            fiscal_year: '2023'
          }
        }
      },
      'hospital-data': {
        type: 'table',
        data: {
          columns: ['Hospital Name', 'Beds', 'Occupancy (%)', 'Patients/Day', 'Staff', 'Specialties'],
          rows: [
            ['City General Hospital', 500, 85, 1200, 800, 'Cardiology, Neurology, Surgery'],
            ['Regional Medical Center', 300, 90, 800, 500, 'Oncology, Pediatrics, Emergency'],
            ['Community Hospital', 150, 75, 400, 250, 'General Medicine, Maternity'],
            ['Specialty Clinic', 50, 60, 200, 100, 'Cardiology, Orthopedics'],
            ['Emergency Hospital', 200, 95, 600, 300, 'Emergency, Trauma, ICU']
          ]
        }
      }
    };

    setNodes(sampleNodes);
    setLinks(sampleLinks);
    setNodeData(sampleData);
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
      document: '#EF4444',
      table: '#06B6D4'
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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const addToFocus = (node) => {
    setFocusedNodes(prev => new Set([...prev, node.id]));
    setFocusMode(true);
    // Don't clear search or query filters - let them work additively with focus
  };

  const removeFromFocus = (nodeId) => {
    setFocusedNodes(prev => {
      const newSet = new Set(prev);
      newSet.delete(nodeId);
      if (newSet.size === 0) {
        setFocusMode(false);
      }
      return newSet;
    });
  };

  const clearFocus = () => {
    setFocusMode(false);
    setFocusedNodes(new Set());
  };

  // Filter nodes based on search query, focus mode, or query filters
  const getFilteredNodes = () => {
    let filteredNodes = nodes;
    
    // Apply search filter first (if active)
    if (searchQuery.trim()) {
      filteredNodes = filteredNodes.filter(node => 
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply query mode filters (if in query mode and filters are active)
    if (currentMode === 'query' && activeFilters.nodeTypes.size > 0) {
      filteredNodes = filteredNodes.filter(node => activeFilters.nodeTypes.has(node.type));
    }
    
    // Apply focus mode additively (if active)
    if (focusMode && focusedNodes.size > 0) {
      // Get connections of focused nodes
      const connectedNodeIds = new Set();
      links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        if (focusedNodes.has(sourceId)) {
          connectedNodeIds.add(targetId);
        }
        if (focusedNodes.has(targetId)) {
          connectedNodeIds.add(sourceId);
        }
      });
      
      // Combine previously filtered nodes with focused nodes and their connections
      const focusedAndConnected = new Set([
        ...focusedNodes,
        ...connectedNodeIds
      ]);
      
      // Keep nodes that are either in the previous filter results OR in the focus set
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      return nodes.filter(node => 
        filteredNodeIds.has(node.id) || focusedAndConnected.has(node.id)
      );
    }
    
    return filteredNodes;
  };

  // Filter links based on visible nodes
  const getFilteredLinks = () => {
    const visibleNodes = getFilteredNodes();
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    
    return links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      // Check if both source and target are visible
      const bothNodesVisible = visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
      
      // In query mode, also check relationship type filters
      if (currentMode === 'query' && activeFilters.relationshipTypes.size > 0) {
        return bothNodesVisible && activeFilters.relationshipTypes.has(link.type);
      }
      
      return bothNodesVisible;
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
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        focusMode={focusMode}
        focusedNodes={focusedNodes}
        onClearFocus={clearFocus}
      />
      
      <div className="flex flex-1">
        <LeftSidebar 
          currentMode={currentMode}
          nodes={nodes}
          links={links}
          activeFilters={activeFilters}
          onFilterChange={updateFilters}
          onClearFilters={clearAllFilters}
          searchQuery={searchQuery}
          filteredNodes={getFilteredNodes()}
        />
        
        <GraphCanvas 
          nodes={getFilteredNodes()}
          links={getFilteredLinks()}
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          onNodeSelect={selectNode}
          onLinkSelect={selectLink}
          getNodeColor={getNodeColor}
          activeFilters={activeFilters}
          currentMode={currentMode}
          searchQuery={searchQuery}
          focusMode={focusMode}
          focusedNodes={focusedNodes}
          onAddToFocus={addToFocus}
          onRemoveFromFocus={removeFromFocus}
        />
        
        <div className="flex flex-col w-80 border-l border-gray-700">
          <RightPanel 
            selectedNode={selectedNode}
            selectedLink={selectedLink}
            onDeleteNode={deleteNode}
            onDeleteLink={deleteLink}
            getNodeConnections={getNodeConnections}
            focusMode={focusMode}
            focusedNodes={focusedNodes}
            onAddToFocus={addToFocus}
            onRemoveFromFocus={removeFromFocus}
          />
          <div className="border-t border-gray-700 h-1/2">
            <ErrorBoundary>
              <DataViewer 
                nodeData={nodeData}
                selectedNode={selectedNode}
                nodes={nodes}
                links={links}
              />
            </ErrorBoundary>
          </div>
        </div>
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
