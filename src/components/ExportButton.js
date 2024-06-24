import React from 'react';

function ExportButton({ rectangles }) {
  const exportData = () => {
    const output = rectangles.map((rect, index) => ({
      style: {
        top: `${rect.y}px`,
        left: `${rect.x}px`,
        rotate: `${rect.rotation}deg`,
        height: `${rect.height}px`,
        width: `${rect.width}px`,
        backgroundColor: "#000000"
      },
      available: false,
      unit: parseInt(rect.unit,10),
      squareNum: index + 1
    }));
    
    const jsonOutput = JSON.stringify(output, null, 2);
    navigator.clipboard.writeText(jsonOutput);
    alert('Data copied to clipboard!');
  };

  return <button onClick={exportData}>Export Data</button>;
}

export default ExportButton;