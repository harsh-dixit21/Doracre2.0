import { useState } from 'react';
import api from '../utils/api';

function ImageUpload({ onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      console.log('📤 Uploading file:', selectedFile.name);

      const response = await api.post('/predict/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload successful:', response.data);
      
      // ✅ FIXED: Call onSuccess instead of onUpload
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      
      alert('✅ Image analyzed successfully!');
    } catch (error) {
      console.error('❌ Upload failed:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert('❌ Upload failed: ' + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-500 hover:shadow-lg transition-all duration-300">
        {preview ? (
          <div className="mb-6 relative group">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto rounded-xl mx-auto max-h-96 object-contain shadow-2xl border-4 border-white"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
              <p className="text-white opacity-0 group-hover:opacity-100 font-semibold text-lg">
                Preview
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="mb-4 flex justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-full shadow-lg">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Upload Skin Image
            </h3>
            <p className="text-gray-600 mb-1">
              Click to upload or drag and drop your image here
            </p>
            <p className="text-sm text-gray-500">
              Supported: PNG, JPG, JPEG • Max size: 10MB
            </p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {preview ? 'Choose Different Image' : 'Select Image'}
        </label>
      </div>

      {selectedFile && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Selected File</p>
                <p className="text-gray-800 font-semibold truncate max-w-xs">
                  {selectedFile.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Size</p>
              <p className="text-gray-800 font-semibold">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing Image...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Start AI Analysis
              </span>
            )}
          </button>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-semibold mb-1">
              How to get accurate results:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload clear, well-lit images</li>
              <li>• Focus on the affected area</li>
              <li>• Avoid blurry or dark photos</li>
              <li>• For best results, consult a dermatologist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUpload;
