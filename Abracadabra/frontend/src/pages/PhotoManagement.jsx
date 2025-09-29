import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PhotoManagement = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [uploadType, setUploadType] = useState('single');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [message, setMessage] = useState('');
  const [propertyPhotos, setPropertyPhotos] = useState({});
  
  const navigate = useNavigate();

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties/csv');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        console.error('Failed to fetch properties:', response.status);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    
    // Preview files
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // You can add preview functionality here
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const uploadSinglePhoto = async () => {
    if (!selectedProperty || selectedFiles.length === 0) {
      setMessage('Please select a property and a photo file');
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFiles[0]);
    formData.append('propertyId', selectedProperty);

    try {
      setUploading(true);
              const response = await fetch('/api/photos/upload', {
          method: 'POST',
          body: formData,
        });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Photo uploaded successfully: ${result.photoUrl}`);
        setSelectedFiles([]);
        fetchPropertyPhotos(selectedProperty);
      } else {
        setMessage(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Upload error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiplePhotos = async () => {
    if (!selectedProperty || selectedFiles.length === 0) {
      setMessage('Please select a property and photo files');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('photos', file);
    });
    formData.append('propertyId', selectedProperty);

    try {
      setUploading(true);
              const response = await fetch('/api/photos/upload-multiple', {
          method: 'POST',
          body: formData,
        });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${selectedFiles.length} photos uploaded successfully`);
        setSelectedFiles([]);
        fetchPropertyPhotos(selectedProperty);
      } else {
        setMessage(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Upload error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const fetchPropertyPhotos = async (propertyId) => {
    // This would fetch existing photos for the property
    // You might need to add an endpoint to list photos by property
    try {
      const response = await fetch(`/api/photos/${propertyId}`);
      if (response.ok) {
        const photos = await response.json();
        setPropertyPhotos(prev => ({ ...prev, [propertyId]: photos }));
      }
    } catch (error) {
      console.error('Error fetching property photos:', error);
    }
  };

  const deletePhoto = async (fileName) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch('/api/photos/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ Photo deleted successfully');
        fetchPropertyPhotos(selectedProperty);
      } else {
        setMessage(`❌ Delete failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Delete error: ${error.message}`);
    }
  };

  const handleUpload = () => {
    if (uploadType === 'single') {
      uploadSinglePhoto();
    } else {
      uploadMultiplePhotos();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">📸 Property Photo Management</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← Back to Home
            </button>
          </div>

          {/* Property Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Property
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => {
                setSelectedProperty(e.target.value);
                if (e.target.value) fetchPropertyPhotos(e.target.value);
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a property...</option>
              {properties.map((property, index) => (
                <option key={index} value={index + 1}>
                  {property.developer_name} - {property.project_name} ({property.property_type}, {property.rooms_count} rooms)
                </option>
              ))}
            </select>
          </div>

          {/* Upload Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={uploadType === 'single'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                Single Photo
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="multiple"
                  checked={uploadType === 'multiple'}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2"
                />
                Multiple Photos
              </label>
            </div>
          </div>



          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Photos
            </label>
            <input
              type="file"
              multiple={uploadType === 'multiple'}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: JPEG, PNG, WebP. Max size: 10MB per file.
              {uploadType === 'multiple' && ' (Max 10 files)'}
            </p>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-md">
                    <p className="text-xs text-gray-600 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="mb-6">
            <button
              onClick={handleUpload}
              disabled={!selectedProperty || selectedFiles.length === 0 || uploading}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {uploading ? '⏳ Uploading...' : `📤 Upload ${uploadType === 'single' ? 'Photo' : 'Photos'}`}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-md mb-6 ${
              message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Existing Photos Display */}
          {selectedProperty && propertyPhotos[selectedProperty] && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Photos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyPhotos[selectedProperty].map((photo, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg p-4">
                    <img
                      src={photo.url}
                      alt={photo.type}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                                         <p className="text-sm font-medium">Property Photo</p>
                    <button
                      onClick={() => deletePhoto(photo.fileName)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">📋 Instructions</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• <strong>Single Photo:</strong> Upload one photo at a time</p>
              <p>• <strong>Multiple Photos:</strong> Upload several photos at once</p>
              <p>• <strong>File Formats:</strong> JPEG, PNG, WebP supported</p>
              <p>• <strong>File Size:</strong> Maximum 10MB per image</p>
              <p>• <strong>Management:</strong> View and delete existing property photos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoManagement; 