import React from 'react';

const Header = ({ 
  currentMode, 
  onModeChange, 
  onAddNode, 
  onAddLink, 
  onSave, 
  onReset 
}) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-project-diagram text-blue-400 text-xl"></i>
          <h1 className="text-xl font-bold">GraphStudio</h1>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button 
            onClick={() => onModeChange('create')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currentMode === 'create' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-edit mr-1"></i>Create
          </button>
          <button 
            onClick={() => onModeChange('query')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currentMode === 'query' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-search mr-1"></i>Query
          </button>
        </div>
        
        {/* Create Mode Tools */}
        {currentMode === 'create' && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={onAddNode}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm flex items-center space-x-1"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Node</span>
            </button>
            <button 
              onClick={onAddLink}
              className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-sm flex items-center space-x-1"
            >
              <i className="fa-solid fa-link"></i>
              <span>Link</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search nodes..." 
            className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm w-64 pl-8"
          />
          <i className="fa-solid fa-search absolute left-2.5 top-2 text-gray-400 text-sm"></i>
        </div>
        <button 
          onClick={onReset}
          className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm"
        >
          <i className="fa-solid fa-home"></i>
        </button>
        <button 
          onClick={onSave}
          className="bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded text-sm"
        >
          <i className="fa-solid fa-save"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
