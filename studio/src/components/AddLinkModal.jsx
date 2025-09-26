import React, { useState } from 'react';

const AddLinkModal = ({ nodes, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    source: '',
    target: '',
    type: 'manages',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.source || !formData.target) return;
    
    if (formData.source === formData.target) {
      alert('Source and target nodes cannot be the same');
      return;
    }
    
    onCreate(formData);
    setFormData({ source: '', target: '', type: 'manages', description: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Add New Relationship</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Source Node</label>
            <select 
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              required
            >
              <option value="">Select source node...</option>
              {nodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Node</label>
            <select 
              name="target"
              value={formData.target}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              required
            >
              <option value="">Select target node...</option>
              {nodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Relationship Type</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
            >
              <option value="manages">Manages</option>
              <option value="oversees">Oversees</option>
              <option value="reports_to">Reports To</option>
              <option value="collaborates_with">Collaborates With</option>
              <option value="contains">Contains</option>
              <option value="part_of">Part Of</option>
              <option value="works_with">Works With</option>
              <option value="supervises">Supervises</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 h-16"
              placeholder="Optional description..."
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLinkModal;
