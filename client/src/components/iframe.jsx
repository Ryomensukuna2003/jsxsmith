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
      // Wrap the code in an App component
      return `
        function App() {
          return (
            <div>
              ${codeString}
            </div>
          );
        }
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
      `;
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
          <body>
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
      sandbox="allow-scripts allow-same-origin"
      title={title}
      {...props}
    />
  );
};

export default Iframe;
