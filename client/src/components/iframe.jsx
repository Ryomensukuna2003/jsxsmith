import React from "react";

const Iframe = (code) => {
  return (
    <iframe
      srcDoc={`
        <!DOCTYPE html>
            <html>
                <head>
                    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                      body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
                    </style>
                </head>
                <body>
                    <div id="root"></div>
                        <script type="text/babel">
                            ${code.code || ""}    
                            const root = ReactDOM.createRoot(document.getElementById('root'));
                            root.render(<App />);
                        </script>
                </body>
            </html>
        `}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="React Component Preview"
    />
  );
};

export default Iframe;
