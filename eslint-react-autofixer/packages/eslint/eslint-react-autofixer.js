import jsxNoBind from "./rules/jsx-no-bind.js"
import propsInInitialState from "./rules/props-in-initial-state.js"
import jsxOutsideRenderMethod from "./rules/jsx-outside-render-method.js"
import coLocatedSmells from "./rules/co-located-smells.js"
import directDOMManipulation from "./rules/direct-DOM-manipulation.js"

const plugin = { 
    rules: { 
        "jsx-no-bind": jsxNoBind,
        "props-in-initial-state": propsInInitialState,
        "jsx-outside-render-method": jsxOutsideRenderMethod,
        "co-located-smells": coLocatedSmells,
        "direct-DOM-manipulation": directDOMManipulation,
    } 
};

export default plugin;