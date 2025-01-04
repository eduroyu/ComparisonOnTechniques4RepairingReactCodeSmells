import babelParser from "@babel/eslint-parser";
import eslintReactAutofixer from "./packages/eslint/eslint-react-autofixer.js";

export default [
    {
        files: ["**/*.js", "**/*.ts","**/*.jsx", "**/*.tsx"],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    babelrc: false,
                    configFile: false,
                    presets: ["@babel/preset-react"],
                }
            },
            sourceType: "module",
            ecmaVersion: "latest",
        },
        plugins: {
            eslintReactAutofixer: eslintReactAutofixer,
        },
        rules: {
            'eslintReactAutofixer/jsx-no-bind': ['error', {
                allowBind: false,
                allowArrowFunctions: false,
            }],
            'eslintReactAutofixer/props-in-initial-state': 'error',
            'eslintReactAutofixer/jsx-outside-render-method': 'error',
            'eslintReactAutofixer/co-located-smells': 'error',
            'eslintReactAutofixer/direct-DOM-manipulation': 'error',
        },
    }
];