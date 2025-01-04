import React from 'react';

function MyComponent() {
  const currentUrl = document.documentURI;

  return (
    <div>
      <p>La URL actual es: {currentUrl}</p>
    </div>
  );
}
