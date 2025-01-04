// enforce-foo-bar.test.js
import { RuleTester } from "eslint";
import jsxOutsideRenderMethod from "../rules/jsx-outside-render-method";

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run('jsx-outside-render-method', jsxOutsideRenderMethod, {
  valid: [
    {
        //Test bueno único método render
        code: `
        class Gallery extends React.Component {
            render() {
               return (
                  <div>
                     <div> 
                         Image
                         <div> Comment </div>
                     </div>
                     <div> Comment </div>
                  </div>
               );
            }
         }
        `
    },
    {
        //Test con componente funcional
        code: `
        function Gallery() {
            return (
                <div>
                   <div> 
                       Image
                       <div> Comment </div>
                   </div>
                   <div> Comment </div>
                </div>
             );
        }
        `
    },
    {
        //Test con doble renderizado sin composicion
        code: `
        class Gallery extends React.Component {
            render() {
               return (
                  <div>
                     <div> 
                         Image
                         <div> Comment </div>
                     </div>
                     <div> Comment </div>
                  </div>
               );
            }

            renderPremium() {
                return (
                    <div>
                        Premium
                    </div>
                )
            }
         }
        `
    },
    {
        //Test con método sin devolver JSX
        code: `
        class Gallery extends React.Component {
            render() {
               return (
                  <div>
                     <div> 
                         Image
                         <div> Comment </div>
                     </div>
                     <div> Comment </div>
                  </div>
               );
            }

            hello() {
                return (
                    "Hello"
                )
            }
         }
        `
    }
  ],
  invalid: [
    {
        code: `
        import { Component } from "react";

        class Header extends Component {
            state = {
                open: false
            };
        
            renderLogo() {
                return <img src="logo.png" />;
            }
        
            render() {
                return (
                    <header>
                        {this.renderLogo()}
                        <ul>
                            <li>Link</li>
                            <li>Link</li>
                            <li>Link</li>
                        </ul>
                    </header>
                );
            }
        }
        `,
        output: `
        import { Component } from "react";

        class Header extends Component {
            state = {
                open: false
            };
        
            
        
            render() {
                return (
                    <header>
                        <img src="logo.png" />
                        <ul>
                            <li>Link</li>
                            <li>Link</li>
                            <li>Link</li>
                        </ul>
                    </header>
                );
            }
        }
        `,
        errors: [
            {
                message: 'There should be no methods that return JSX except for render'
            }
        ]
    },
    {
        code: `
        import { Component } from "react";

        class Header extends Component {
            state = {
                open: false
            };
        
            logo() {
                return <img src="logo.png" />;
            }
        
            render() {
                return (
                    <header>
                        {this.logo()}
                        <ul>
                            <li>Link</li>
                            <li>Link</li>
                            <li>Link</li>
                        </ul>
                    </header>
                );
            }
        }
        `,
        output: `
        import { Component } from "react";

        class Header extends Component {
            state = {
                open: false
            };
        
            
        
            render() {
                return (
                    <header>
                        <img src="logo.png" />
                        <ul>
                            <li>Link</li>
                            <li>Link</li>
                            <li>Link</li>
                        </ul>
                    </header>
                );
            }
        }
        `,
        errors: [
            {
                message: 'There should be no methods that return JSX except for render'
            }
        ]
    }
  ],
});
