import esquery from "esquery";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Avoid initializing the component state with inherited properties",
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

    var identifiersInTree = [];
    var statementsToDelete = [];
    var variablesToSearch = [];
    var argumentsNames = [];

    function report(node, message, fix) {
      context.report({
        node: node,
        message: message,
        fix: fix,
      });
    }

    function shouldIgnore(comment) {
      return comment && esquery(comment, '[value="@ignoreRule-PIIS"]').length > 0;;
    }

    /**
     * Obtiene el nombre de las propiedades heredadas
     * @param {*} node
     * @returns
     */
    function getArgumentsNames(node) {
      const params = esquery(node, ".params");
      return params.map((param) => param.name);
    }

    /**
     * Devuelve true en caso de estar en un constructor o en un getInitialState
     * @param {*} node
     * @returns
     */
    function isConstructorOrGetInitialState(node) {
      return node.kind === "constructor" || node.key.name === "getInitialState";
    }

    /**
     * Comprueba si inicializa propiedades utilizando las propiedades heredadas
     * @param {*} node
     * @returns
     */
    function hasPropsInitialization(node) {
      if (!isConstructorOrGetInitialState(node)) {
        return false;
      }

      let body = node.value.body.body;

      argumentsNames = getArgumentsNames(node);

      for (const statement of body) {
        if (
          statement.type === "ExpressionStatement" &&
          statement.expression.type === "AssignmentExpression"
        ) {
          const left = statement.expression.left;
          const right = statement.expression.right;

          if (
            left &&
            left.type === "MemberExpression" &&
            left.object &&
            left.object.type === "ThisExpression" &&
            left.property &&
            left.property.name === "state" &&
            right &&
            right.type === "ObjectExpression" &&
            right.properties
          ) {
            for (const prop of right.properties) {
              if (prop.value && !shouldIgnore(sourceCode.getCommentsBefore(prop))) {
                // Verificar si algún identificador del árbol está en argumentsNames
                identifiersInTree = esquery(prop.value, "Identifier");
                if (
                  identifiersInTree.some((identifier) =>
                    argumentsNames.includes(identifier.name)
                  )
                ) {
                  // Se encontró una inicialización de estado con argumentos heredados
                  // entonces almacenar las instrucciones que deberan ser borradas y las variables que deberan ser buscadas
                  statementsToDelete.push(prop);
                  variablesToSearch.push(prop.key.name);
                }
              }
            }
          }
        } else if (
          statement.type === "ReturnStatement" &&
          statement.argument &&
          statement.argument.type === "ObjectExpression" &&
          statement.argument.properties
        ) {
          // Maneja el caso de 'getInitialState'
          for (const prop of statement.argument.properties) {
            if (prop.value) {
              identifiersInTree = esquery(prop.value, "Identifier");

              if (
                identifiersInTree.some((identifier) =>
                  argumentsNames.includes(identifier.name)
                )
              ) {
                statementsToDelete.push(prop);
                variablesToSearch.push(prop.key.name);
              }
            }
          }
        }
      }

      //Devuelve true si hay alguna inicializacion de propiedades en el constructor/getInitialState
      return statementsToDelete.length !== 0;
    }

    /**
     * Reemplaza las ocurrencias de this.state por props en aquellas ocurrencias necesarias
     * @returns 
     */
    function replaceThisStateWithParam() {
      return function (fixer) {
        const fixes = [];

        // Utilizar esquery para encontrar todos los nodos 'ThisExpression'
        // Se busca este nodo y no otros superiores por eficiencia
        const thisExpressions = esquery(sourceCode.ast, "ThisExpression");

        // Filtra los nodos que cumplen ciertas condiciones
        const thisExpressionsToChange = thisExpressions.filter(
          (thisExpression) => {
            const parentNode = thisExpression.parent;

            return (
              parentNode &&
              parentNode.type === "MemberExpression" &&
              parentNode.property &&
              parentNode.property.name === "state" &&
              parentNode.parent &&
              parentNode.parent.property &&
              variablesToSearch.includes(parentNode.parent.property.name)
            );
          }
        );

        // Realiza el reemplazo de 'this.state' por 'props'
        thisExpressionsToChange.forEach((thisExpression) => {
          const range = [
            thisExpression.range[0],
            thisExpression.parent.property.range[1],
          ];
          fixes.push(fixer.replaceTextRange(range, argumentsNames[0]));
        });

        return fixes;
      };
    }

    /**
     * Elimina las sentencias que provocan el smell y corrige lo necesario
     * @returns 
     */
    function fixSmellMethod() {
      return function (fixer) {
        const rangesToRemove = statementsToDelete.map((statement) => {
          const lastToken = sourceCode.getTokenAfter(statement);
          const prevToken = sourceCode.getTokenBefore(statement);
    
          if (lastToken && lastToken.value === ",") {
            return [statement.range[0], lastToken.range[1]];
          } else if (prevToken && prevToken.value === ",") {
            return [prevToken.range[0], statement.range[1]];
          } else {
            return [statement.range[0], statement.range[1]];
          }
        });
    
        const mergedRanges = [];
        rangesToRemove.sort((a, b) => a[0] - b[0]);
    
        for (let i = 0; i < rangesToRemove.length; i++) {
          const [start, end] = rangesToRemove[i];
          if (mergedRanges.length === 0 || mergedRanges[mergedRanges.length - 1][1] < start) {
            mergedRanges.push([start, end]);
          } else {
            mergedRanges[mergedRanges.length - 1][1] = Math.max(
              mergedRanges[mergedRanges.length - 1][1],
              end
            );
          }
        }
    
        const fixes = mergedRanges.map(([start, end]) => fixer.removeRange([start, end]));
    
        const thisStateFixes = replaceThisStateWithParam()(fixer);
    
        const allFixes = fixes.concat(thisStateFixes);
        return allFixes;
      };
    }    

    return {
      MethodDefinition(node) {
        if (hasPropsInitialization(node)) {
          report(
            node,
            "Avoid initializing state with inherited properties in the constructor or getInitialState.",
            fixSmellMethod()
          );
        }
      },
    };
  },
};
