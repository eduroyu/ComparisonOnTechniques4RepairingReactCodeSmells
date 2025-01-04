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
    var settersUseState = [];
    var variablesUseState = [];
    var propNames = [];

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
        const fixes = statementsToDelete.map((statement) => {
          const lastToken = sourceCode.getTokenAfter(statement);
          //Logica necesaria porque el AST no incluye la , en los nodos
          if (lastToken && lastToken.value === ",") {
            const commaRange = [lastToken.range[0], lastToken.range[1] + 1];
            return fixer.replaceTextRange(commaRange, "");
          }
          return fixer.remove(statement);
        });

        //El doble parentesis es para pasarle fixer a la funcion que devuelve replaceThisStateWithParam
        const thisStateFixes = replaceThisStateWithParam()(fixer);
        const allFixes = fixes.concat(thisStateFixes);
        return allFixes
      };
    }

    /**
     * Obtiene el nombre de las propiedades heredadas (props)
     * @param {*} node
     * @returns {Array<String>}
     */
        function getInheritedProps(node) {
          // Buscar el primer argumento de la función del componente (normalmente las props)
          const params = node.params[0];
    
          // Si el primer argumento es un objeto (destructuring), devuelve los nombres de las propiedades
          if (params && params.type === "ObjectPattern") {
            return params.properties.map((prop) => prop.key.name);
          }
    
          // Si no es un objeto (destructuring), devuelve el nombre del parámetro tal cual (ej. props)
          if (params && params.type === "Identifier") {
            return [params.name];
          }
    
          // Si no se encuentran props, devuelve un array vacío
          return [];
        }
    
        /**
         * Detecta si las props heredadas se usan en la inicialización del estado con useState
         * @param {*} node
         * @param {*} propNames
         * @returns {Boolean}
         */
        function isStateUsingInheritedPropsInFunction(node, propNames) {
          const useStateCalls = esquery(node, 'CallExpression[callee.name="useState"]');
          
          for (const call of useStateCalls) {
            const stateInitializer = call.arguments[0];
    
            // Buscar identificadores dentro del inicializador de estado
            const identifiersInState = esquery(stateInitializer, 'Identifier');
            
            // Comprobar si alguna de las props heredadas está siendo usada en useState
            const usesInheritedProp = identifiersInState.some((identifier) =>
              propNames.includes(identifier.name)
            );
            
            if (usesInheritedProp) {
              variablesUseState.push(call.parent.id.elements[0].name);
              settersUseState.push(call.parent.id.elements[1].name);              
              statementsToDelete.push(call.parent.parent)
              return true;
            }
          }
          return false;
        }
    
        /**
         * Detecta si se utilizan las props heredadas para inicializar el estado
         * @param {*} node
         */
        function detectPropUsageInState(node) {
          // Extraer los nombres de las props heredadas
          propNames = getInheritedProps(node);
          
          // Verificar si `useState` usa props heredadas
          if (isStateUsingInheritedPropsInFunction(node, propNames)) {
            return true;
          }
    
          return false;
        }

        /**
         * Obtiene las variables o propiedades en el retorno de `getInitialState` que usan props heredadas.
         * @returns {Array<String>} - Lista de variables o propiedades que utilizan props heredadas.
         */
        function getVariablesOfSmellInGetInitialState() {
          let variablesUsingProps = [];

          // Buscar el método getInitialState en el AST
          const getInitialStateNodes = esquery(sourceCode.ast, 'VariableDeclarator[id.name="getInitialState"]');
          
          getInitialStateNodes.forEach((node) => {
            // Verificar que el cuerpo del método contiene un return
            const returnStatements = esquery(node, 'ReturnStatement');
            
            returnStatements.forEach((returnStatement) => {
              const returnArgument = returnStatement.argument;

              if (returnArgument) {
                // Caso 1: Si el return devuelve directamente una variable
                if (returnArgument.type === 'Identifier') {
                  const identifiersInReturn = esquery(returnArgument, 'Identifier');
                  identifiersInReturn.forEach((identifier) => {
                    if (propNames.includes(identifier.name)) {
                      variablesUsingProps.push(identifier.name);
                    }
                  });
                }
                // Caso 2: Si el return devuelve un objeto con varias propiedades
                else if (returnArgument.type === 'ObjectExpression') {
                  returnArgument.properties.forEach((prop) => {
                    const identifiersInPropValue = esquery(prop.value, 'Identifier');

                    identifiersInPropValue.forEach((identifier) => {
                      if (propNames.includes(identifier.name)) {
                        variablesUsingProps.push(prop.key.name); // Agregar la clave del objeto
                      }
                    });
                  });
                }
                // Caso 3: Si el return es una expresión como list.concat(props)
                else if (returnArgument.type === 'CallExpression') {
                  const callee = returnArgument.callee;

                  variablesUsingProps.push(callee.object.name);
                }
              }
            });
          });

          return variablesUsingProps;
        }

        
        /**
         * Elimina las llamadas a useState que inicializan el estado con props heredadas
         * @returns {Function}
         */
        function fixStateInitialization() {
          return function (fixer) {
            const fixes = [];
            
            const settersCalls = esquery(sourceCode.ast, 'CallExpression[callee.type="Identifier"]');
            settersCalls.forEach((callExpression) => {

              // Si el método llamado es uno de los setters encontrados
              if (settersUseState.includes(callExpression.callee.name)) {
                fixes.push(fixer.remove(callExpression.parent.parent.parent));
              }
            });

            var getInitialStateVariable = getVariablesOfSmellInGetInitialState();

            if (getInitialStateVariable.length > 0) {
              // TODO: Provisionalmente este fix solo aplicará a una variable
              const replacementVariable = getInitialStateVariable[0];

              // Buscar todas las ocurrencias de variablesUseState
              const variableUsages = esquery(sourceCode.ast, 'Identifier');
              
              
              variableUsages.forEach((usage) => {
                const parent = usage.parent;
        
                // Verificar si es una definición de useState (evitar sustituir aquí)
                const isDefiningInUseState = 
                  parent && 
                  parent.type === "ArrayPattern" && 
                  parent.elements &&
                  variablesUseState.includes(usage.name);

                // Realizar sustitución solo si no es definición ni setter
                if (variablesUseState.includes(usage.name) && !isDefiningInUseState) {

                  // Verificar si es una llamada a un setter (evitar sustituir aquí)
                  const isSetterCall = 
                  parent.parent.parent &&
                  parent.parent.parent.type === "CallExpression" &&
                  parent.parent.parent.callee &&
                  settersUseState.includes(parent.parent.parent.callee.name);
                  
                  if (!isSetterCall){
                    fixes.push(fixer.replaceText(usage, replacementVariable));
                  }
                }
              });
            }
            // TODO sustituir variablesUseState por la variable almacenada en getInitialStateVariable (por el momento solo puede ser una)

            // Reutilizamos las variables que ya se han llenado en la detección
            // `statementsToDelete` debería contener las llamadas a useState que deben ser eliminadas
            statementsToDelete.forEach((statement) => {
              // Eliminar toda la llamada a useState
              fixes.push(fixer.remove(statement));
            });

            return fixes;
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
      ArrowFunctionExpression(node) {
        if (detectPropUsageInState(node)) {
          report(
            node,
            "Avoid initializing state with inherited properties in useState.",
            fixStateInitialization()
          );
        }
      },
    };
  },
};
