//Doble ejemplo arrowFunction

import React from 'react';

function MyComponent(props) {
	return (
    <div>
      <div onClick={() => console.log("Hello!")}>Click me</div>;
      <div onClick={() => console.log("Hello!" + props)}>Click me</div>;
    </div>
  )
}