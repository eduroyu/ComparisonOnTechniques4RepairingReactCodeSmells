import React, { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const images = document.images;
    console.log(images);
  }, []);

  return (
    <div>
      <img src="path_to_image_1" alt="Image 1" />
      <img src="path_to_image_2" alt="Image 2" />
    </div>
  );
}

export default MyComponent;