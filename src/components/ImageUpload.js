import React from 'react';

function ImageUpload({ setImage }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return <input type="file" accept="image/*" onChange={handleImageUpload} />;
}

export default ImageUpload;