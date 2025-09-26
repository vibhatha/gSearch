import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GraphCanvas = ({ 
  nodes, 
  links, 
  selectedNode, 
  selectedLink, 
  onNodeSelect, 
  onLinkSelect, 
  getNodeColor, 
  activeFilters, 
  currentMode 
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const simulationRef = useRef();
  const zoomRef = useRef();

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize D3 visualization
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select('.graph-group');

    // Clear existing content
    g.selectAll('*').remove();

    // Initialize zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Initialize force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(30));

    simulationRef.current = simulation;

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8)
      .on('click', (event, d) => {
        event.stopPropagation();
        onLinkSelect(d);
      });

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeSelect(d);
      });

    // Add circles to nodes
    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', d => d === selectedNode ? '#F59E0B' : '#fff')
      .attr('stroke-width', d => d === selectedNode ? 4 : 2);

    // Add text to nodes
    node.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .text(d => d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [nodes, links, dimensions, getNodeColor, selectedNode, onNodeSelect, onLinkSelect]);

  // Apply filters
  useEffect(() => {
    if (currentMode !== 'query' || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select('.graph-group');

    // Filter nodes
    g.selectAll('.node')
      .style('opacity', d => {
        if (activeFilters.nodeTypes.size === 0) return 1;
        return activeFilters.nodeTypes.has(d.type) ? 1 : 0.1;
      })
      .style('pointer-events', d => {
        if (activeFilters.nodeTypes.size === 0) return 'all';
        return activeFilters.nodeTypes.has(d.type) ? 'all' : 'none';
      });

    // Filter links
    g.selectAll('.link')
      .style('opacity', d => {
        if (activeFilters.nodeTypes.size === 0) return 0.8;
        const sourceType = typeof d.source === 'object' ? d.source.type : nodes.find(n => n.id === d.source)?.type;
        const targetType = typeof d.target === 'object' ? d.target.type : nodes.find(n => n.id === d.target)?.type;
        const relationshipVisible = activeFilters.relationshipTypes.size === 0 || activeFilters.relationshipTypes.has(d.type);
        return (activeFilters.nodeTypes.has(sourceType) && activeFilters.nodeTypes.has(targetType) && relationshipVisible) ? 0.8 : 0.1;
      });
  }, [activeFilters, currentMode, nodes]);

  const zoomIn = () => {
    if (zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.5);
    }
  };

  const zoomOut = () => {
    if (zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1 / 1.5);
    }
  };

  const centerView = () => {
    if (zoomRef.current && dimensions.width > 0) {
      d3.select(svgRef.current).transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(1)
      );
    }
  };

  return (
    <main className="flex-1 relative">
      <div ref={containerRef} className="w-full h-full bg-gray-900 relative overflow-hidden">
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="w-full h-full"
        >
          <g className="graph-group"></g>
        </svg>
        
        {/* Mini-map */}
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
          <svg className="w-full h-full">
            {/* Mini-map content would go here */}
          </svg>
        </div>
        
        {/* Canvas Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button 
            onClick={zoomIn}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg border border-gray-600"
          >
            <i className="fa-solid fa-plus text-sm"></i>
          </button>
          <button 
            onClick={zoomOut}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg border border-gray-600"
          >
            <i className="fa-solid fa-minus text-sm"></i>
          </button>
          <button 
            onClick={centerView}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg border border-gray-600"
          >
            <i className="fa-solid fa-crosshairs text-sm"></i>
          </button>
        </div>
      </div>
    </main>
  );
};

export default GraphCanvas;
