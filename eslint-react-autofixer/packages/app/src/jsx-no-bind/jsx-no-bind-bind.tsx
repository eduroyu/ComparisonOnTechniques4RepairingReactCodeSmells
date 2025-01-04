//Doble ejemplo .bind()

import React from 'react';

function MyComponent() {
	return (
    <div>
      <div onClick={this.handleClick.bind(this)}>Click me</div>;
      <div onClick={this.handleClick.bind(this)}>Click me</div>;
    </div>
  )
}