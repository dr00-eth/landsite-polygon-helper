import React, { useState } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import Canvas from './components/Canvas';
import ExportButton from './components/ExportButton';

function App() {
  const [image, setImage] = useState(null);
  const [rectangles, setRectangles] = useState([]);

  return (
    <div className="App">
      <h1>Land Site Overlay Tool</h1>
      <p><small>Upload Map, Double-Click to Add Rectangle, Select to Transform, Double Select to Edit Unit Num, Copy/Paste Auto-Increments Unit Num</small></p>
      <ImageUpload setImage={setImage} />
      {image && (
        <Canvas
          image={image}
          rectangles={rectangles}
          setRectangles={setRectangles}
        />
      )}
      <ExportButton rectangles={rectangles} />
    </div>
  );
}

export default App;