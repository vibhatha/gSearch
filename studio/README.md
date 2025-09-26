# GraphStudio - Interactive Node Relationship Studio

A powerful React-based graph visualization tool for creating, managing, and exploring node relationships. Built with React, D3.js, and Tailwind CSS.

## Features

### 🎨 Interactive Graph Visualization
- **Force-directed layout** with D3.js physics simulation
- **Drag and drop** node positioning
- **Zoom and pan** controls for navigation
- **Real-time updates** as you modify the graph

### 🏗️ Node Management
- **Create nodes** with different types (Person, Organization, Department, Project, Document)
- **Custom properties** for each node (name, type, description)
- **Visual node types** with color-coded categories
- **Delete nodes** with automatic relationship cleanup

### 🔗 Relationship Management
- **Create relationships** between nodes
- **Multiple relationship types** (manages, oversees, reports to, etc.)
- **Bidirectional connections** support
- **Relationship descriptions** for additional context

### 🔍 Query & Filter Mode
- **Filter by node type** to focus on specific categories
- **Filter by relationship type** to explore specific connections
- **Real-time filtering** with instant visual updates
- **Complete hiding** of non-matching nodes and links (not just transparency)
- **Query statistics** showing visible nodes and links

### 🔎 Search Functionality
- **Search nodes by name** with real-time filtering
- **Case-insensitive search** for easy node discovery
- **Complete hiding** of non-matching nodes and links
- **Visual search indicators** with highlighted search input
- **Clear search** with one-click reset
- **Search results display** in the sidebar

### 🎯 Additive Focus Mode
- **Available in both Create and Query modes** - focus functionality works everywhere
- **Progressive exploration** - double-click nodes to add them to focus
- **Additive focus** - keeps previously focused nodes while adding new ones
- **Works with existing filters** - focus mode preserves search and query filters
- **Complete hiding** of non-focused nodes and links
- **Visual focus indicators** with highlighted focused nodes
- **Individual focus controls** - add/remove nodes from focus individually
- **Smart filtering** - shows all focused nodes and their connections
- **Focus history tracking** - maintain multiple focused nodes simultaneously

### 🎛️ User Interface
- **Dual-mode interface** (Create/Query modes)
- **Properties panel** for detailed node/link information
- **Search functionality** for finding specific nodes
- **Responsive design** with Tailwind CSS
- **Dark theme** optimized for data visualization

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd graph-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Usage

### Creating Nodes
1. Switch to **Create mode** (default)
2. Click the **"Node"** button in the toolbar
3. Fill in the node details:
   - Name (required)
   - Type (Person, Organization, Department, Project, Document)
   - Description (optional)
4. Click **"Create"** to add the node to the graph

### Creating Relationships
1. In **Create mode**, click the **"Link"** button
2. Select source and target nodes from the dropdowns
3. Choose a relationship type
4. Add an optional description
5. Click **"Create"** to establish the connection

### Querying the Graph
1. Switch to **Query mode** using the mode toggle
2. Use the **Node Type filters** to show/hide specific node types
3. Use the **Relationship filters** to focus on specific connection types
4. View **Query Results** statistics in the sidebar
5. Use **"Clear All Filters"** to reset the view

### Searching Nodes
1. **Type in the search box** in the top-right corner
2. **View filtered results** - only matching nodes and their connections will be visible
3. **See search results** in the left sidebar under "Search Results"
4. **Clear search** by clicking the X button or clearing the input
5. **Search is case-insensitive** - type any part of the node name

### Additive Focus Mode
1. **Works in both Create and Query modes** - focus functionality is always available
2. **Double-click any node** to add it to focus (keeps previously focused nodes)
3. **Progressive exploration** - continue double-clicking to add more nodes
4. **Preserves existing filters** - focus works additively with search and query filters
5. **View all focused nodes and their connections** - additive filtering
6. **Individual control** - use "Add to Focus" / "Remove from Focus" buttons in properties
7. **Clear all focus** by clicking "Clear Focus" in the header
8. **Visual feedback** - focused nodes are larger with orange borders

### Navigation
- **Drag nodes** to reposition them
- **Zoom in/out** using the control buttons or mouse wheel
- **Pan** by dragging empty space
- **Center view** to reset the camera position
- **Select nodes/links** to view their properties

## Project Structure

```
src/
├── components/
│   ├── Header.js              # Top toolbar with mode toggle and controls
│   ├── LeftSidebar.js         # Node explorer and query filters
│   ├── GraphCanvas.js         # Main D3.js visualization component
│   ├── RightPanel.js         # Properties panel for selected items
│   ├── AddNodeModal.js       # Modal for creating new nodes
│   └── AddLinkModal.js       # Modal for creating relationships
├── App.js                     # Main application component
├── App.css                    # Application-specific styles
├── index.js                   # React entry point
└── index.css                  # Global styles and Tailwind imports
```

## Technology Stack

- **Vite** - Fast build tool and development server
- **React 18** - Modern React with hooks
- **D3.js v7** - Data visualization and force simulation
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icon library
- **Inter Font** - Modern typography

## Vite Benefits

This project uses [Vite](https://vite.dev/guide/) as the build tool, which provides:

- **⚡ Lightning fast HMR** - Hot Module Replacement updates in milliseconds
- **🚀 Fast cold starts** - Development server starts instantly
- **📦 Optimized builds** - Production builds are smaller and faster
- **🔧 Simple configuration** - Minimal setup with sensible defaults
- **🌐 Modern ES modules** - Native ES module support during development

## Key Features Implementation

### Force Simulation
The graph uses D3's force simulation with multiple forces:
- **Link force** - Maintains relationship distances
- **Charge force** - Prevents node overlap
- **Center force** - Keeps graph centered
- **Collision force** - Ensures proper node spacing

### State Management
- **React hooks** for local state management
- **Centralized data** in the main App component
- **Real-time updates** across all components
- **Filter state** for query mode functionality

### Responsive Design
- **Flexbox layout** for adaptive sizing
- **Tailwind utilities** for consistent styling
- **Mobile-friendly** interface design
- **Scalable components** for different screen sizes

## Customization

### Adding New Node Types
1. Update the `getNodeColor` function in `App.js`
2. Add new options to the node type select in `AddNodeModal.js`
3. Update the color mapping for visual consistency

### Adding New Relationship Types
1. Add new options to the relationship select in `AddLinkModal.js`
2. Update the relationship type filters in `LeftSidebar.js`

### Styling Customization
- Modify `tailwind.config.js` for theme customization
- Update `App.css` for component-specific styles
- Customize colors in the `getNodeColor` function

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **D3.js** for powerful data visualization capabilities
- **Tailwind CSS** for rapid UI development
- **React** for component-based architecture
- **Font Awesome** for comprehensive icon library
