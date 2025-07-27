"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Code, Eye, Copy, Check } from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Iframe from "@/components/iframe"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useSession, signIn, signOut } from "next-auth/react"
import { codeTemplates, defaultCode } from "@/lib/codeTemplates"

export default function AICodeInterface() {
  const { data: session } = useSession()
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [generatedCode, setGeneratedCode] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [copied, setCopied] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // Store user in database when they sign in
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.isNewUser) {
            console.log('New user stored in database:', data.user)
          }
        })
        .catch(error => console.error('Error storing user:', error))
    }
  }, [session])


  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract code from AI messages when messages change
  useEffect(() => {
    const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop()

    if (lastAssistantMessage) {
      const codeMatch = lastAssistantMessage.content.match(/```(?:jsx?|tsx?)\n([\s\S]*?)\n```/)
      if (codeMatch) {
        setGeneratedCode(codeMatch[1])
      }
    }
  }, [messages])

  // Get current code to display
  const getCurrentCode = () => {
    // Return selected template code if available
    if (selectedTemplate) {
      return selectedTemplate.code
    }

    return generatedCode
  }

  const currentCode = getCurrentCode();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Nav Bar */}
      <div className="text-2xl border-2 flex justify-between p-2 bg-white">
        <div>JSXsmith</div>
        <div className="flex gap-4">
          {session ? (
            <>
              <div className="flex self-center text-gray-700 text-sm">Welcome, {session.user.name}</div>
              <img
                src={session.user.image}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <Button variant="outline" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => signIn()}>Login</Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Chat Interface */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-slate-900 text-white flex flex-col">
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

            {/* Messages Area with Fixed ScrollArea */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full p-4">
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
            </div>

            {/* Input Form */}
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
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Side - Preview/Code Area */}
          <ResizablePanel defaultSize={75} className="flex flex-col">
            <div className="border-b bg-white p-2">
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
              </Tabs>
            </div>

            <div className="flex-1 min-h-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsContent value="preview" className="h-full m-0">
                  <div className="h-full bg-white">
                    {currentCode || defaultCode ? (
                      <Iframe
                        code={currentCode || defaultCode}
                        className="w-full h-full border-0"
                        title="React Component Preview"
                      />
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
                    <div className="absolute top-4 right-4 z-10">
                      {(currentCode || defaultCode) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(currentCode || defaultCode)}
                          className="flex items-center gap-2"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                      )}
                    </div>
                    {currentCode || defaultCode ? (
                      <SyntaxHighlighter
                        language="jsx"
                        style={vscDarkPlus}
                        className="text-sm"
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          paddingTop: '3rem',
                          height: '100%',
                          overflow: 'auto',
                          backgroundColor: 'rgb(15 23 42)'
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}