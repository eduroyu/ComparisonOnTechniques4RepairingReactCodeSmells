import esquery from "esquery";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "This is a selection of code smells to improve the efficience of the plugin",
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

    //Variable for button-has-type
    let typeValue = null;

    function report(node, message, fix) {
      context.report({
        node: node,
        message: message,
        fix: fix,
      });
    }

    /**Comienzo de funciones de require-render-return */
    function hasNotReturnStatement(node) {
      return !node.body.body.some((statement) => statement.type === "ReturnStatement");
    }

    function fixRequireReturnInRender(node) {
      return (fixer) => {
        const bodyOfRender = node.body.body;
        let codeToKeep = "";
        let firstLineIndentation = "";

        // Recorrer todas las sentencias del cuerpo del método render
        for (const statement of bodyOfRender) {
          // Almacenar el texto de las sentencias anteriores al ReturnStatement
          codeToKeep += sourceCode.getText(statement);

          // Capturar la indentación de la primera línea del método render
          if (firstLineIndentation === "") {
            const lines = sourceCode.getText(statement).split("\n");
            const firstLineIndentMatch = /^\s*/.exec(lines[0]);
            if (firstLineIndentMatch) {
              firstLineIndentation = firstLineIndentMatch[0];
            }
          }
        }

        // Construir el texto del nuevo cuerpo del método render con el ReturnStatement
        const newText =
          `\n\treturn (\n\t\t${codeToKeep.trim()}\n\t);\n`.replace(
            /\n/g,
            `\n\t${firstLineIndentation}`
          );

        // Calcular el rango del cuerpo del método render
        const range = node.body.range;
        const start = range[0] + 1; // +1 para omitir el '{'
        const end = range[1] - 1; // -1 para omitir el '}'

        // Devolver la corrección para eliminar las sentencias anteriores y agregar el ReturnStatement
        return fixer.replaceTextRange([start, end], newText);
      };
    }



    /**Comienzo de funciones de button-has-type */
    function hasNotOECorrectType(node) {
      const properties = node.parent.arguments[1].properties;

      // Verificar si el objeto tiene una propiedad 'type' con valor 'reset', 'button' o 'submit'
      for (const prop of properties) {
        if (prop.key.name === "type" && ["reset", "button", "submit"].includes(prop.value.value)) {
          typeValue = prop.value.value;
          return false;
        }
      }

      return true;
    }

    function hasNotJSXCorrectType(node) {
      const attributes = node.parent.attributes;

      // Verificar si el objeto tiene un atributo 'type' con valor 'reset', 'button' o 'submit'
      if (attributes) {
        const typeAttribute = attributes.find((attribute) => attribute.name.name === "type");

        if (typeAttribute && ["reset", "button", "submit"].includes(typeAttribute.value.value)) {
          typeValue = typeAttribute.value.value;
          return false;
        }
      }

      return true;
    }

    function fixButtonHasType(node) {
      const parentNode = node.parent;

      if (typeValue === null || !["reset", "button", "submit"].includes(typeValue)) {
        // Si el atributo 'type' no existe o no tiene un valor válido, ajustarlo
        const typeAttributeValue = typeValue || "button"; // Establecer el valor predeterminado como 'button' si no existe

        if (parentNode.type === "JSXOpeningElement") {
          // Si es JSX, crear un nuevo atributo 'type' con el valor adecuado
          const newTypeAttribute = `type="${typeAttributeValue}"`;

          // Reemplazar solo el atributo 'type' en el JSXOpeningElement
          const range = parentNode.range;
          const start = range[0] + 1; // +1 para omitir el '<'
          const end = range[1] - 1; // -1 para omitir el '>'
          return (fixer) =>
            fixer.replaceTextRange(
              [start, end],
              `${parentNode.name.name} ${newTypeAttribute}`
            );

        } else if (parentNode.arguments[1].type === "ObjectExpression") {
          // Si es un objeto, modificar directamente el objeto properties
          const properties = parentNode.arguments[1].properties;
          const typeProperty = properties.find(
            (prop) => prop.key.name === "type"
          );

          if (typeProperty) {
            // Reemplazar el valor de la propiedad 'type'
            const range = typeProperty.value.range;
            const start = range[0];
            const end = range[1];
            return (fixer) =>
              fixer.replaceTextRange([start, end], `"${typeAttributeValue}"`);
          } else {
            // Agregar la nueva propiedad 'type' dentro del objeto dependiendo de si hay más propiedades o no
            const insertPos =
              properties.length > 0
                ? properties[0].range[0]
                : parentNode.arguments[1].range[0] + 1; // +1 para omitir la '{'
            const newText = `type: "${typeAttributeValue}", `;
            return (fixer) =>
              fixer.insertTextBeforeRange([insertPos, insertPos], newText);
          }
        }
      } else {
        // No se necesita corrección
        return null;
      }
    }

    /**Comienzo de funciones para no-access-state-in-setstate */
    function useThisState(node) {
      return (
        esquery(
          node.parent,
          'MemberExpression[property.name = "state"] > ThisExpression'
        ).length > 0
      );
    }

    function fixNoAccessStateInSetState(node) {
      const parentArgs = node.parent.arguments;
      const textSetState = sourceCode
        .getText(parentArgs[0])
        .replace(/this\.state/g, "prevState");
      const newArgs = `prevState => (${textSetState})`;
      return (fixer) => fixer.replaceText(parentArgs[0], newArgs);
    }

    return {
      FunctionExpression(node) {
        if (node.parent.key.name === "render" && hasNotReturnStatement(node))
          report(
            node,
            "Render method must contain a Return Statement",
            fixRequireReturnInRender(node)
          );
      },
      MemberExpression(node) {
        if (
          node.property.name === "createElement" &&
          node.parent.arguments[0].value === "button" &&
          hasNotOECorrectType(node)
        ) {
          report(
            node,
            "Button elements must have an explicit type attribute",
            fixButtonHasType(node)
          );
        } else if (node.property.name === "setState" && useThisState(node)) {
          report(
            node,
            "Usage this.state inside setState might result in errors, try to use callback with previous state",
            fixNoAccessStateInSetState(node)
          );
        }
      },
      JSXIdentifier(node) {
        if (
          node.name === "button" &&
          node.parent.type === "JSXOpeningElement" &&
          hasNotJSXCorrectType(node)
        ) {
          report(
            node,
            "Button elements must have an explicit type attribute",
            fixButtonHasType(node)
          );
        }
      },
    };
  },
};
