import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  maxLength = 3000,
  placeholder = "Enter text to convert to speech...",
  error
}) => {
  const charactersUsed = value.length;
  const isNearLimit = charactersUsed > maxLength * 0.8;
  const isOverLimit = charactersUsed > maxLength;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Text to Convert
      </label>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          className={`w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
            error || isOverLimit
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        
        {/* Character Counter */}
        <div className="absolute bottom-3 right-3">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isOverLimit
              ? 'bg-red-100 text-red-700'
              : isNearLimit
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {charactersUsed.toLocaleString()}/{maxLength.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {(error || isOverLimit) && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error || `Text exceeds maximum length of ${maxLength.toLocaleString()} characters`}</span>
        </div>
      )}

      {/* Character Limit Warning */}
      {isNearLimit && !isOverLimit && !error && (
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Approaching character limit</span>
        </div>
      )}
    </div>
  );
};

export default TextInput;