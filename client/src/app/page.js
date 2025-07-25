"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Code, Eye, Copy, Check } from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function AICodeInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [generatedCode, setGeneratedCode] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [copied, setCopied] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // Template examples for demonstration
  const codeTemplates = [
    {
      id: 1,
      name: "Button Component",
      code: `function Button({ children, variant = "primary", onClick }) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  
  return (
    <button
      className={\`\${baseClasses} \${variants[variant]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function App() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Button Examples</h1>
      <div className="space-x-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="danger">Danger Button</Button>
      </div>
    </div>
  );
}`
    },
    {
      id: 2,
      name: "Card Component",
      code: `function Card({ title, description, image, buttonText }) {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
      {image && (
        <img className="w-full h-48 object-cover" src={image} alt={title} />
      )}
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Card Example</h1>
      <Card 
        title="Beautiful Card"
        description="This is a beautiful card component with Tailwind CSS styling."
        image="https://via.placeholder.com/400x200"
        buttonText="Learn More"
      />
    </div>
  );
}`
    },
    {
      id: 3,
      name: "Todo List",
      code: `import React, { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Todo List</h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a new todo..."
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4"
            />
            <span className={\`flex-1 \${todo.completed ? 'line-through text-gray-500' : ''}\`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return <TodoApp />;
}`
    }
  ];

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract code from AI messages or use template
  const extractCodeFromMessages = () => {
    const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop()

    if (lastAssistantMessage) {
      const codeMatch = lastAssistantMessage.content.match(/```(?:jsx?|tsx?)\n([\s\S]*?)\n```/)
      if (codeMatch) {
        setGeneratedCode(codeMatch[1])
        return codeMatch[1]
      }
    }

    // Return selected template code if available
    if (selectedTemplate) {
      return selectedTemplate.code
    }

    return generatedCode
  }

  const currentCode = extractCodeFromMessages()

  // Fallback code if no code is generated yet
  const defaultCode = `function App() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to AI Code Generator</h1>
      <p className="text-gray-600 mb-6">Ask me to create any React component!</p>
      <div className="bg-blue-50 p-6 rounded-lg">
        <p className="text-blue-800">Try asking for:</p>
        <ul className="text-blue-700 mt-2 space-y-1">
          <li>• "Create a login form"</li>
          <li>• "Build a product card"</li>
          <li>• "Make a navigation bar"</li>
        </ul>
      </div>
    </div>
  );
}`


  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Nav Bar */}
      <div className="text-2xl border-2 flex justify-between p-2 bg-white">
        <div>Logo</div>
        <div className="flex gap-4">
          <Button variant={"solid"}>Login</Button>
          <Button>Signup</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chat Interface */}
        <div className="w-80 bg-slate-900 text-white flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h1 className="text-lg font-semibold">AI Code Assistant</h1>
            <p className="text-sm text-slate-300 mt-1">Generate React components instantly</p>
          </div>

          {/* Template Quick Actions */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Quick Templates</h3>
            <div className="space-y-2">
              {codeTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setActiveTab("preview");
                  }}
                  className="w-full text-left p-2 text-sm bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <Code className="h-8 w-8 mx-auto mb-3" />
                  <p className="text-sm">Start a conversation to generate code</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${message.role === "user" ? "bg-blue-600 ml-4" : "bg-slate-700 mr-4"}`}>
                  <div className="text-xs text-slate-300 mb-1">{message.role === "user" ? "You" : "AI"}</div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="bg-slate-700 mr-4 p-3 rounded-lg">
                  <div className="text-xs text-slate-300 mb-1">AI</div>
                  <div className="text-sm">Generating code...</div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-slate-700">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Describe the component you want..."
                className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400" />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side - Preview/Code Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b bg-white p-2">
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Code
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1">
                  {(currentCode || defaultCode) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(currentCode || defaultCode)}
                      className="ml-auto flex"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </div>

                <TabsContent value="preview" className="h-screen m-0">
                  <div className="h-screen bg-white">
                    {currentCode || defaultCode ? (
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
                                ${currentCode || defaultCode}
                                
                                const root = ReactDOM.createRoot(document.getElementById('root'));
                                root.render(<App />);
                              </script>
                            </body>
                          </html>
                        `}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                        title="React Component Preview" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Ask the AI to generate React code to see the preview here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="code" className="h-full m-0">
                  <div className="h-full bg-slate-900 relative">
                    {currentCode || defaultCode ? (
                      <SyntaxHighlighter
                        language="jsx"
                        style={vscDarkPlus}
                        className="h-full text-sm"
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          height: '100%',
                          overflow: 'auto'
                        }}
                      >
                        {currentCode || defaultCode}
                      </SyntaxHighlighter>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500">
                        <div className="text-center">
                          <Code className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                          <p>Generated code will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
