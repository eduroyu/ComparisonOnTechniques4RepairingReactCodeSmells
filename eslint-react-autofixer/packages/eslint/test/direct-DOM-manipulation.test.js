// enforce-foo-bar.test.js
import { RuleTester } from "eslint";
import directDOMManipulation from "../rules/direct-DOM-manipulation.js";

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('direct-DOM-manipulation', directDOMManipulation, {
  valid: [
    {
        code: `
        
        function MyComponent() {
        
            return (
            <div>
                <img src="path_to_image_1" alt="Image 1" />
                <img src="path_to_image_2" alt="Image 2" />
            </div>
            );
        }
        
        export default MyComponent;
        `
    },
    {
        code: `
        
        import React, { useEffect } from 'react';
        import ReactDOM from'react-dom';

        function MyComponent() {
        useEffect(() => {
            const images = ReactDOM.findDOMNode(this).querySelectorAll('img');
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
        `
    }
  ],
  invalid: [
    {
      code: `
        import React, { useState, useEffect } from 'react';

        const BadExample = () => {
            const [data, setData] = useState(null);

            useEffect(() => {
                const fetchData = async () => {
                    const response = await fetch('https://api.example.com/data');
                    const result = await response.json();
                    setData(result);
                    
                    // Ejemplo de manipulación directa del DOM
                    const newElement = document.createElement('div');
                };

                fetchData();
            }, []);

            return (
                <div>
                    {data && <span>{data}</span>}
                </div>
            );
        };
        
        export default BadExample;
      `,
      output: `
        import React, { useState, useEffect } from 'react';

        const BadExample = () => {
            const [data, setData] = useState(null);

            useEffect(() => {
                const fetchData = async () => {
                    const response = await fetch('https://api.example.com/data');
                    const result = await response.json();
                    setData(result);
                    
                    // Ejemplo de manipulación directa del DOM
                    const newElement = <div></div>;
                };

                fetchData();
            }, []);

            return (
                <div>
                    {data && <span>{data}</span>}
                </div>
            );
        };
        
        export default BadExample;
      `,
      errors: [
        {
          message: 'Avoid direct DOM manipulation in React',
        },
      ],
    },
    {
        code: `
        import React, { useEffect } from 'react';

        function MyComponent() {
            useEffect(() => {
                const allParas = document.getElementsByTagName('p');
                // Haz algo con los elementos
                console.log(allParas);
            }, []);
        
            return (
                <div>
                    <p>Este es un párrafo 1</p>
                    <p>Este es un párrafo 2</p>
                    <p>Este es un párrafo 3</p>
                </div>
            );
        }
        `,
        output: `
        import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

        function MyComponent() {
            useEffect(() => {
                const allParas = ReactDOM.findDOMNode(this).querySelectorAll('p');
                // Haz algo con los elementos
                console.log(allParas);
            }, []);
        
            return (
                <div>
                    <p>Este es un párrafo 1</p>
                    <p>Este es un párrafo 2</p>
                    <p>Este es un párrafo 3</p>
                </div>
            );
        }
        `,
        errors: [
          {
            message: 'Avoid direct DOM manipulation in React',
          },
        ],
      },
      {
        code: `
        import React, { useEffect } from 'react';
        import ReactDOM from 'react-dom';

        function MyComponent() {
            useEffect(() => {
                const allParas = document.getElementsByTagName('p');
                // Haz algo con los elementos
                console.log(allParas);
            }, []);
        
            return (
                <div>
                    <p>Este es un párrafo 1</p>
                    <p>Este es un párrafo 2</p>
                    <p>Este es un párrafo 3</p>
                </div>
            );
        }
        `,
        output: `
        import React, { useEffect } from 'react';
        import ReactDOM from 'react-dom';

        function MyComponent() {
            useEffect(() => {
                const allParas = ReactDOM.findDOMNode(this).querySelectorAll('p');
                // Haz algo con los elementos
                console.log(allParas);
            }, []);
        
            return (
                <div>
                    <p>Este es un párrafo 1</p>
                    <p>Este es un párrafo 2</p>
                    <p>Este es un párrafo 3</p>
                </div>
            );
        }
        `,
        errors: [
          {
            message: 'Avoid direct DOM manipulation in React',
          },
        ],
      },
      {
        code: `
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
        `,
        output: `
        import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

        function MyComponent() {
          useEffect(() => {
            const images = ReactDOM.findDOMNode(this).querySelectorAll('img');
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
        `,
        errors: [
          {
            message: 'Avoid direct DOM manipulation in React',
          },
        ],
      },
      {
        code: `
        import React, { useEffect } from 'react';
        import ReactDOM from 'react-dom';

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
        `,
        output: `
        import React, { useEffect } from 'react';
        import ReactDOM from 'react-dom';

        function MyComponent() {
          useEffect(() => {
            const images = ReactDOM.findDOMNode(this).querySelectorAll('img');
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
        `,
        errors: [
          {
            message: 'Avoid direct DOM manipulation in React',
          },
        ],
      },
      {
        code: `
        import React from 'react';

        function MyComponent() {
            const currentUrl = document.documentURI;

            return (
                <div>
                    <p>La URL actual es: {currentUrl}</p>
                </div>
            );
        }
        `,
        output: `
        import React from 'react';

        function MyComponent() {
            const currentUrl = window.location.href;

            return (
                <div>
                    <p>La URL actual es: {currentUrl}</p>
                </div>
            );
        }
        `,
        errors: [
          {
            message: 'Avoid direct DOM manipulation in React',
          },
        ],
      },
  ],
});
