import domMethods from "./utils/direct-dom-manipulation-utils.js";
import esquery from "esquery";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow direct DOM manipulation",
    },
    fixable: "code",
    schema: [],
  },
  create: function (context) {
    const sourceCode = context.getSourceCode();

    function report(node, message, fix) {
      context.report({
        node: node,
        message: message,
        fix: fix,
      });
    }

    function checkForReactDOMImports(fixer) {
      // Verificar si ya hay un import de ReactDOM
      const imports = esquery(sourceCode.ast, "ImportDeclaration");
      const importReactDOM = imports.find(
        (importDeclaration) => importDeclaration.source.value === "react-dom"
      );

      // Agregar el import de ReactDOM si no existe
      if (!importReactDOM) {
        const lastImport = imports[imports.length - 1];
        const importText = "import ReactDOM from 'react-dom';";

        return fixer.insertTextAfter(lastImport, "\n" + importText);
      }

      return;
    }

    function fixDirectDOMManipulation(node) {
      return function (fixer) {
        switch (node.property.name) {
          case "createElement":
            return fixCreateElementUse(node, fixer);

          case "getElementsByTagName":
            return fixGetElementsByTagNameUse(node, fixer);

          case "images":
            return fixImagesUse(node, fixer);

          case "documentURI":
            return fixDocumentURIUse(node, fixer);

          default:
            return null;
        }
      };
    }

    function fixCreateElementUse(node, fixer) {
      const htmlTag = node.parent.arguments[0].value;
      const textToReplace = `<${htmlTag}><\/${htmlTag}>`;
      const rangeToReplace = [node.parent.range[0], node.parent.range[1]];
      return fixer.replaceTextRange(
        rangeToReplace,
        textToReplace
      );
    }

    function fixGetElementsByTagNameUse(node, fixer) {
      const textToReplace = `ReactDOM.findDOMNode(this).querySelectorAll`;
      const rangeToReplace = [node.range[0], node.range[1]];
      const fixMethod = fixer.replaceTextRange(
        [rangeToReplace[0], rangeToReplace[1]],
        textToReplace
      );
      const fixWithImports = checkForReactDOMImports(fixer);
      return fixWithImports === undefined
        ? fixMethod
        : [fixWithImports, fixMethod];
    }

    function fixImagesUse(node, fixer) {
      const textToReplace = `ReactDOM.findDOMNode(this).querySelectorAll('img')`;
      const rangeToReplace = [node.range[0], node.range[1]];
      const fixMethod = fixer.replaceTextRange(
        [rangeToReplace[0], rangeToReplace[1]],
        textToReplace
      );
      const fixWithImports = checkForReactDOMImports(fixer);
      return fixWithImports === undefined
        ? fixMethod
        : [fixWithImports, fixMethod];
    }

    function fixDocumentURIUse(node, fixer) {
      const textToReplace = "window.location.href";
      const rangeToReplace = [node.range[0], node.range[1]];
      return fixer.replaceTextRange(rangeToReplace, textToReplace);
    }

    return {
      MemberExpression: function (node) {
        const objectName = node.object.name;
        if (objectName == "document" && domMethods().includes(node.property.name)) {
          report(
            node,
            "Avoid direct DOM manipulation in React",
            fixDirectDOMManipulation(node)
          );
        }
      },
    };
  },
};
