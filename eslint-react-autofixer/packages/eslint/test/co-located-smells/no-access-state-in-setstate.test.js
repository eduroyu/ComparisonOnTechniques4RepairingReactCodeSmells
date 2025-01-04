// enforce-foo-bar.test.js
import { RuleTester } from "eslint";
import coLocatedSmells from "../../rules/co-located-smells.js";

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('co-located-smells', coLocatedSmells, {
  valid: [
    {
        code: `
        import React, { Component } from "react";

        class MyComponent extends Component {
            constructor(props) {
                super(props);
                this.state = {
                    value: 1
                };
            }

            increment() {
                this.setState({value: 1});
            }
        }
        `
    },
    {
        code: `
        import React, { Component } from "react";

        class MyComponent extends Component {
            constructor(props) {
                super(props);
                this.state = {
                    value: 1
                };
            }

            increment() {
                this.setState(prevState => {value: prevState.value + 1});
            }
        }
        `
    },
  ],
  invalid: [
    {
        code: `
        import React, { Component } from "react";

        class MyComponent extends Component {
            constructor(props) {
                super(props);
                this.state = {
                    value: 1
                };
            }
        
            increment() {
                this.setState({value: this.state.value + 1});
            }
        }
        `,
        output: `
        import React, { Component } from "react";

        class MyComponent extends Component {
            constructor(props) {
                super(props);
                this.state = {
                    value: 1
                };
            }
        
            increment() {
                this.setState(prevState => ({value: prevState.value + 1}));
            }
        }
        `, 
        errors: [
            {
                message: 'Usage this.state inside setState might result in errors, try to use callback with previous state'
            }
        ]
    },
  ]
});