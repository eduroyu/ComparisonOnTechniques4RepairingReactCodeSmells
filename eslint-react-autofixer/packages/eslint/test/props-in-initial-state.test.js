// enforce-foo-bar.test.js
import { RuleTester } from "eslint";
import propsInInitialState from "../rules/props-in-initial-state.js";

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('props-in-intial-state', propsInInitialState, {
  valid: [
    {
      code: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            getInitialState(props) {
                return {
                    name: ""
                };
            }
      
            render() {
                return <div>{props.inputVal + this.state.name}</div>;
            }
        }
      `,
    },


    {
      code: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            constructor(props){
              super(props)
              this.state = {
                name: ""
              }
            }
      
            render() {
                return <div>{props.inputVal + this.state.name}</div>;
            }
        }
      `,
    },


    {
      code: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            constructor(props) {
                super(props)
                this.state = {
                  //@ignoreRule-PIIS
                  inputVal: props.inputVal,

                };
            }
        
            render() {
                return <div>{this.state.input}</div>;
            }
        }
      `,
    },
  ],
  invalid: [
    //Ejemplo con estado inicializado en getInitialState sin usar el estado
    {
      code: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            getInitialState(props) {
                return {
                    inputVal: this.props.inputVal
                };
            }
        
            render() {
                return <div>{this.state.name}</div>;
            }
        }
      `,
      output: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            getInitialState(props) {
                return {
                    
                };
            }
        
            render() {
                return <div>{this.state.name}</div>;
            }
        }
      `,
      errors: [
        {
          message: 'Avoid initializing state with inherited properties in the constructor or getInitialState.',
        },
      ],
    },
    
    //Ejemplo usando el estado en otra parte del código
    {
      code: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            getInitialState(props) {
                return {
                    inputVal: this.props.inputVal
                };
            }
        
            render() {
                return <div>{this.state.inputVal + this.state.name}</div>;
            }
        }
      `,
      output: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            getInitialState(props) {
                return {
                    
                };
            }
        
            render() {
                return <div>{this.state.inputVal + this.state.name}</div>;
            }
        }
      `,
      errors: [
        {
          message: 'Avoid initializing state with inherited properties in the constructor or getInitialState.',
        },
      ],
    },

    //Ejemplo con estado inicializado en constructor sin usar el estado
    {
      code: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            constructor(props) {
                super(props)
                this.state = {
                    inputVal: props.inputVal
                };
            }
        
            render() {
                return <div>{this.state.name}</div>;
            }
        }
      `,
      output: `
        import React, { Component } from 'react';

        class UserPassword extends Component {
            constructor(props) {
                super(props)
                this.state = {
                    
                };
            }
        
            render() {
                return <div>{this.state.name}</div>;
            }
        }
      `,
      errors: [
        {
          message: 'Avoid initializing state with inherited properties in the constructor or getInitialState.',
        },
      ],
    },

  ],
});
