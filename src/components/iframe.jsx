import React from "react";

const Iframe = ({
  code,
  children,
  className = "w-full h-full border-0",
  title = "React Component Preview",
  ...props
}) => {
  // Process the code to determine how to render it
  const processCode = (codeString) => {
    if (!codeString) return "";

    // Check if code already has an App component
    const hasAppComponent =
      codeString.includes("function App") || codeString.includes("const App");

    if (hasAppComponent) {
      // Code already has App component, use it as is
      return `
        ${codeString}
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
      `;
    } else {
      // Check if this is a component definition with export
      const componentMatch = codeString.match(
        /(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/
      );
      const exportMatch = codeString.match(
        /export\s+default\s+([A-Z][a-zA-Z0-9]*);?/
      );

      let componentName = null;

      // Try to get component name from function/const declaration
      if (componentMatch) {
        componentName = componentMatch[1];
      }

      // Or from export statement
      if (exportMatch) {
        componentName = exportMatch[1];
      }

      if (
        componentName &&
        (codeString.includes(`export default ${componentName}`) ||
          codeString.includes(`export default ${componentName};`))
      ) {
        // Remove import statement if present
        let cleanCode = codeString.replace(
          /import\s+React\s+from\s+['"]react['"];\s*\n?/g,
          ""
        );

        // Remove export statement (with or without semicolon)
        cleanCode = cleanCode.replace(
          /export\s+default\s+[A-Z][a-zA-Z0-9]*;?\s*$/gm,
          ""
        );

        return `
          ${cleanCode}
          
          function App() {
            return <${componentName} />;
          }
          
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(<App />);
        `;
      } else {
        // Check if it's just JSX without component wrapper
        const trimmedCode = codeString.trim();
        if (trimmedCode.startsWith("<") && trimmedCode.endsWith(">")) {
          // It's raw JSX
          return `
            function App() {
              return (
                ${codeString}
              );
            }
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          `;
        } else {
          // Fallback: treat as component code
          return `
            ${codeString}
            function App() {
              return (
                <div>
                  Component code executed above
                </div>
              );
            }
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          `;
        }
      }
    }
  };

  const finalCode = code || (children ? `<div>${children}</div>` : "");

  return (
    <iframe
      srcDoc={`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                background: white;
                overflow-x: hidden;
              }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body class="flex items-center justify-center min-h-screen">
            <div id="root"></div>
            <script type="text/babel">
              // Make React hooks available globally
              const { useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef } = React;
              
              try {
                ${processCode(finalCode)}
              } catch (error) {
                console.error('Error rendering component:', error);
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(
                  React.createElement('div', {
                    style: { 
                      padding: '20px', 
                      color: 'red', 
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap'
                    }
                  }, 'Error rendering component:\\n' + error.toString())
                );
              }
            </script>
          </body>
        </html>
      `}
      className={className}
      sandbox="allow-scripts"
      title={title}
      {...props}
    />
  );
};

export default Iframe;
