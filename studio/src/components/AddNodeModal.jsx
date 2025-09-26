import React, { useState } from 'react';

const AddNodeModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'person',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onCreate(formData);
    setFormData({ name: '', type: 'person', description: '' });
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
        <h3 className="text-lg font-semibold mb-4">Add New Node</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Node Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Node Type</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
            >
              <option value="person">Person</option>
              <option value="organization">Organization</option>
              <option value="department">Department</option>
              <option value="project">Project</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 h-20"
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
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNodeModal;
