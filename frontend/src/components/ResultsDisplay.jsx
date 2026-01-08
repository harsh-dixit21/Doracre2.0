import { useState } from 'react';

function ResultsDisplay({ results }) {
  // Check if results exist and have predictions
  if (!results) {
    return null;
  }

  if (!results.predictions || results.predictions.length === 0) {
    return (
      <div className="text-center py-12 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <svg
          className="w-16 h-16 text-yellow-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-yellow-800 font-semibold text-lg">No detections found</p>
        <p className="text-yellow-600 text-sm mt-2">
          The AI couldn't detect any skin conditions in this image.
        </p>
        <p className="text-yellow-600 text-sm">
          Try uploading a clearer image of the affected area.
        </p>
      </div>
    );
  }

  // Disease name mapping
  const diseaseNames = {
    'akiec': 'Actinic Keratoses',
    'bcc': 'Basal Cell Carcinoma',
    'bkl': 'Benign Keratosis',
    'df': 'Dermatofibroma',
    'mel': 'Melanoma',
    'nv': 'Melanocytic Nevi',
    'vasc': 'Vascular Lesions'
  };

  // Disease descriptions
  const diseaseDescriptions = {
    'akiec': 'Pre-cancerous skin lesion caused by sun damage',
    'bcc': 'A type of skin cancer that rarely spreads',
    'bkl': 'Non-cancerous skin growth',
    'df': 'Benign fibrous nodule of the skin',
    'mel': 'Serious form of skin cancer - requires immediate medical attention',
    'nv': 'Common mole, usually harmless',
    'vasc': 'Blood vessel-related skin condition'
  };

  // Severity colors based on confidence
  const getSeverityColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-red-100 text-red-800 border-red-300';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  // Risk level icon
  const getRiskIcon = (className) => {
    if (className === 'mel' || className === 'bcc') {
      return (
        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Analysis Complete - {results.predictions.length} Detection{results.predictions.length > 1 ? 's' : ''} Found
            </h3>
            <p className="text-sm text-gray-600">AI-powered skin condition analysis results</p>
          </div>
        </div>
      </div>

      {/* Predictions */}
      {results.predictions.map((prediction, index) => (
        <div
          key={index}
          className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-white"
        >
          <div className="flex items-start justify-between mb-4">
            {/* Disease Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-blue-100 p-3 rounded-xl">
                {getRiskIcon(prediction.class)}
              </div>
              
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-1">
                  {diseaseNames[prediction.class] || prediction.class}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {diseaseDescriptions[prediction.class] || 'Skin condition detected'}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  Class ID: {prediction.class}
                </p>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="text-right">
              <span
                className={`inline-block px-4 py-2 rounded-xl text-lg font-bold border-2 ${getSeverityColor(
                  prediction.confidence
                )}`}
              >
                {(prediction.confidence * 100).toFixed(1)}%
              </span>
              <p className="text-xs text-gray-500 mt-1">Confidence</p>
            </div>
          </div>

          {/* Bounding Box Info */}
          {prediction.bbox && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">📍 Detection Location</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="bg-white p-2 rounded">
                  <span className="font-semibold">Top-Left:</span> ({prediction.bbox[0].toFixed(0)}, {prediction.bbox[1].toFixed(0)})
                </div>
                <div className="bg-white p-2 rounded">
                  <span className="font-semibold">Bottom-Right:</span> ({prediction.bbox[2].toFixed(0)}, {prediction.bbox[3].toFixed(0)})
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className={`rounded-lg p-4 ${
            prediction.class === 'mel' || prediction.class === 'bcc' 
              ? 'bg-red-50 border-2 border-red-200' 
              : 'bg-blue-50 border-2 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <svg
                className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  prediction.class === 'mel' || prediction.class === 'bcc' 
                    ? 'text-red-600' 
                    : 'text-blue-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className={`font-bold text-sm mb-1 ${
                  prediction.class === 'mel' || prediction.class === 'bcc' 
                    ? 'text-red-800' 
                    : 'text-blue-800'
                }`}>
                  {prediction.class === 'mel' || prediction.class === 'bcc' 
                    ? '⚠️ Important Medical Advice Required' 
                    : '💡 Medical Consultation Recommended'}
                </p>
                <p className={`text-sm ${
                  prediction.class === 'mel' || prediction.class === 'bcc' 
                    ? 'text-red-700' 
                    : 'text-blue-700'
                }`}>
                  This is an AI prediction and should not replace professional medical diagnosis. 
                  {prediction.class === 'mel' || prediction.class === 'bcc' 
                    ? ' Please consult a dermatologist immediately.' 
                    : ' Please consult a dermatologist for proper evaluation.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* General Disclaimer */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <svg className="w-8 h-8 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Medical Disclaimer</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Doracare uses artificial intelligence for educational and screening purposes only. 
              This tool is not a substitute for professional medical advice, diagnosis, or treatment. 
              Always seek the advice of a qualified dermatologist or healthcare provider with any questions 
              you may have regarding a skin condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsDisplay;
