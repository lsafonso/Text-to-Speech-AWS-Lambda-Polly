import React from 'react';

const FaviconSVG: React.FC = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle
        cx="16"
        cy="16"
        r="16"
        fill="#0f172a"
      />
      
      {/* Sound waves */}
      <path
        d="M12 10v12M16 8v16M20 12v8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Speaker icon */}
      <path
        d="M8 13v6l3-2v-2l-3-2z"
        fill="white"
      />
    </svg>
  );
};

// Function to generate favicon files
export const generateFavicon = () => {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#0f172a"/>
      <path d="M12 10v12M16 8v16M20 12v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 13v6l3-2v-2l-3-2z" fill="white"/>
    </svg>
  `;
  
  // Create blob URL for download
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = 'favicon.svg';
  link.click();
  
  // Cleanup
  URL.revokeObjectURL(url);
};

export default FaviconSVG;