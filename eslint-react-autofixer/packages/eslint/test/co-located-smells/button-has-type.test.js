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
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = <button type="button">Hello</button>
                return <></>
            }
        }
        `
    },
    {
        code: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = React.createElement('button', {type: 'button', }, 'Hello');
                return <></>
            }
        }
        `
    },
  ],
  invalid: [
    {
        code: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = <button>Hello</button>
                return <></>
            }
        }
        `,
        output: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = <button type="button">Hello</button>
                return <></>
            }
        }
        `, 
        errors: [
            {
                message: 'Button elements must have an explicit type attribute'
            }
        ]
    },
    {
        code: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = <button type="foo">Hello</button>
                return <></>
            }
        }
        `,
        output: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = <button type="button">Hello</button>
                return <></>
            }
        }
        `, 
        errors: [
            {
                message: 'Button elements must have an explicit type attribute'
            }
        ]
    },
    {
        code: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = React.createElement('button', { }, 'Hello');
                return <></>
            }
        }
        `,
        output: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = React.createElement('button', {type: "button",  }, 'Hello');
                return <></>
            }
        }
        `, 
        errors: [
            {
                message: 'Button elements must have an explicit type attribute'
            }
        ]
    },
    {
        code: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = React.createElement('button', {id: "id" }, 'Hello');
                return <></>
            }
        }
        `,
        output: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = React.createElement('button', {type: "button", id: "id" }, 'Hello');
                return <></>
            }
        }
        `, 
        errors: [
            {
                message: 'Button elements must have an explicit type attribute'
            }
        ]
    },
    {
        code: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = React.createElement('button', {type: "foo", }, 'Hello');
                return <></>
            }
        }
        `,
        output: `
        import React from "react";
        import { Component } from "react";

        class Hello extends Component {
            render() {
                var Hello = React.createElement('button', {type: "button", }, 'Hello');
                return <></>
            }
        }
        `, 
        errors: [
            {
                message: 'Button elements must have an explicit type attribute'
            }
        ]
    },
  ]
});