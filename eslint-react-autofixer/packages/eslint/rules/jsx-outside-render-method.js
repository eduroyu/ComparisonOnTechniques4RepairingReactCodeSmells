import esquery from "esquery";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Merge all JSX methods into render method",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
      },
    ],
  },
  create: function (context) {
    const sourceCode = context.getSourceCode();

    // Utiliza esquery para encontrar todos los Identifiers dentro de node pasado como parametro
    const identifiers = esquery(sourceCode.ast, "Identifier");

    /**
     * @param {*} node Nodo en el que se produce la detección
     * @param {*} message Mensaje de error/aviso
     * @param {*} fix Corrección en caso de tenerla
     */
    function report(node, message, fix) {
      context.report({
        node: node,
        message: message,
        fix: fix,
      });
    }

    function checkMethodName(node) {
      const methodDefinition = node.parent.parent.parent;
      if (
        methodDefinition &&
        methodDefinition.type === "MethodDefinition" &&
        methodDefinition.parent &&
        methodDefinition.parent.type === "ClassBody"
      ) {

        const name = methodDefinition.key.name;
        const usages = getMatchingIdentifiers(name).filter(
          (identifier) =>
            identifier.parent.parent.parent.type === "JSXExpressionContainer"
        );
        
        return name === "render" || usages.length == 0;
      }
      return true;
    }

    function getMatchingIdentifiers(name) {
      return identifiers.filter((identifier) => identifier.name === name);
    }

    function getSourceCodeOfMethod(
      matchingIdentifiersWithMethodDefinitionParent
    ) {
      const jsxElements = matchingIdentifiersWithMethodDefinitionParent.flatMap(
        (identifier) => {
          const methodBody = identifier.parent.value.body.body;
          const returnStatement = methodBody.find(
            (statement) => statement.type === "ReturnStatement"
          );
          if (
            returnStatement &&
            returnStatement.argument.type === "JSXElement"
          ) {
            return returnStatement.argument;
          }
          return [];
        }
      );

      return sourceCode.getText(jsxElements[0]);
    }

    function fixJSXOutsideRender(node) {
      const name = node.parent.parent.parent.key.name;

      const matchingIdentifiers = getMatchingIdentifiers(name);

      const matchingIdentifiersWithMethodDefinitionParent =
        matchingIdentifiers.filter(
          (identifier) => identifier.parent.type === "MethodDefinition"
        );

      const jsxSourceCode = getSourceCodeOfMethod(
        matchingIdentifiersWithMethodDefinitionParent
      );

      const matchingIdentifiersWithoutMethodDefinitionParent =
        matchingIdentifiers.filter(
          (identifier) =>
            identifier.parent.parent.parent.type === "JSXExpressionContainer"
        );

      // Se crea una función de corrección para el nodo seleccionado
      return function (fixer) {
        const replaces =  matchingIdentifiersWithoutMethodDefinitionParent.map(
          (nodeToReplace) => {
            const rangeToReplace = [
              nodeToReplace.parent.parent.parent.range[0],
              nodeToReplace.parent.parent.parent.range[1],
            ];
            return fixer.replaceTextRange(rangeToReplace, jsxSourceCode)
          })

        const deletes = matchingIdentifiersWithMethodDefinitionParent.map(
          (nodeToDelete) => {
            return fixer.remove(nodeToDelete.parent)
          }
        )
        return replaces.concat(deletes)
      };
    }

    return {
      ReturnStatement: function (node) {
        if (node.argument.type == "JSXElement" && !checkMethodName(node)) {
          report(
            node,
            "There should be no methods that return JSX except for render",
            fixJSXOutsideRender(node)
          );
        }
      },
    };
  },
};
