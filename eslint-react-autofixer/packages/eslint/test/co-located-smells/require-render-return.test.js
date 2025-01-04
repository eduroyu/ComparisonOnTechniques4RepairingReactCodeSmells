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
        import createReactClass from 'create-react-class';

        
        var Hello = createReactClass({
        render() {
            return(
                <>
                    <div>Hello</div>
                    <div>Hello</div>
                </>
            );
        }
        });
        `
    },
    {
        code: `
        import React from "react";

        
        class Hello extends React.Component {
            render() {
                return(
                    <div>Hello</div>
                );
            }
        }
        `
    },
  ],
  invalid: [
    {
        code: `
import React from "react";
import createReactClass from 'create-react-class';

    
var Hello = createReactClass({
    render() {
        <div>Hello</div>
    }
});
        `,
        output: `
import React from "react";
import createReactClass from 'create-react-class';

    
var Hello = createReactClass({
    render() {\n\t\treturn (\n\t\t\t<div>Hello</div>\n\t\t);\n\t}
});
        `, 
        errors: [
            {
                message: 'Render method must contain a Return Statement'
            }
        ]
    },
    {
        code: `
import React from "react";
import createReactClass from 'create-react-class';

    
var Hello = createReactClass({
    render() {
    <>
        <div>Hello</div>
        <div>Hello</div>
    </>
    }
});
        `,
        output: `
import React from "react";
import createReactClass from 'create-react-class';

    
var Hello = createReactClass({
    render() {\n\t\treturn (\n\t\t\t<>
\t        <div>Hello</div>
\t        <div>Hello</div>
\t    </>\n\t\t);\n\t}
});
        `, 
        errors: [
            {
                message: 'Render method must contain a Return Statement'
            }
        ]
    },
    {
        code: `
import React from "react";

    
class Hello extends React.Component {
    render() {
        <div>Hello</div>
    }
};
        `,
        output: `
import React from "react";

    
class Hello extends React.Component {
    render() {\n\t\treturn (\n\t\t\t<div>Hello</div>\n\t\t);\n\t}
};
        `, 
        errors: [
            {
                message: 'Render method must contain a Return Statement'
            }
        ]
    },
    {
        code: `
import React from "react";

    
class Hello extends React.Component {
    render() {
    <>
        <div>Hello</div>
        <div>Hello</div>
    </>
    }
};
        `,
        output: `
import React from "react";

    
class Hello extends React.Component {
    render() {\n\t\treturn (\n\t\t\t<>
\t        <div>Hello</div>
\t        <div>Hello</div>
\t    </>\n\t\t);\n\t}
};
        `, 
        errors: [
            {
                message: 'Render method must contain a Return Statement'
            }
        ]
    },
  ]
});