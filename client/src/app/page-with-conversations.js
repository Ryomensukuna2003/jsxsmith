"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Code, Eye, Copy, Check, Plus, MessageSquare, Trash2, Edit } from "lucide-react"
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
import { useConversations } from "@/hooks/useConversations"
import { extractCodeFromMessage, generateConversationName, formatMessagesForAI } from "@/lib/conversationUtils"
import { toast } from "sonner"

export default function AICodeInterface() {
  const { data: session } = useSession()
  
  // Conversation management
  const {
    conversations,
    currentConversation,
    loading,
    createConversation,
    loadConversation,
    saveChatMessage,
    deleteConversation,
    updateConversationName
  } = useConversations()

  // Local state
  const [generatedCode, setGeneratedCode] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [copied, setCopied] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [editingConversationId, setEditingConversationId] = useState(null)
  const [editingName, setEditingName] = useState("")

  // Initialize chat with conversation messages
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    onFinish: async (message) => {
      // Save AI response to database
      if (currentConversation) {
        const extractedCode = extractCodeFromMessage(message.content)
        await saveChatMessage(currentConversation.id, 'ai', message.content, extractedCode)
      }
    },
    onError: (error) => {
      console.error('Chat error:', error)
      toast.error("Failed to generate code. Please try again.")
    }
  })

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

  // Handle conversation selection
  const handleConversationSelect = async (conversationId) => {
    const conversation = await loadConversation(conversationId)
    if (conversation) {
      // Convert stored chats to the format expected by useChat
      const chatMessages = formatMessagesForAI(conversation.chats)
      setMessages(chatMessages)
      
      // Find the latest code from the conversation
      const latestCodeSnapshot = conversation.chats
        .reverse()
        .find(chat => chat.codeSnapshot?.jsxCode)
      
      if (latestCodeSnapshot) {
        setGeneratedCode(latestCodeSnapshot.codeSnapshot.jsxCode)
      } else {
        setGeneratedCode("")
      }
    }
  }

  // Handle new conversation
  const handleNewConversation = async () => {
    if (!session) {
      toast.error("Please sign in to create a conversation")
      signIn()
      return
    }
    
    const conversation = await createConversation()
    if (conversation) {
      setMessages([])
      setGeneratedCode("")
      setSelectedTemplate(null)
    }
  }

  // Enhanced form submit that saves to database
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    if (!session) {
      toast.error("Please sign in to generate code")
      signIn()
      return
    }

    // Create new conversation if none exists
    let conversation = currentConversation
    if (!conversation) {
      const conversationName = generateConversationName(input)
      conversation = await createConversation(conversationName)
      if (!conversation) return
    }

    // Save user message to database
    await saveChatMessage(conversation.id, 'user', input)

    // Use the handleSubmit from useChat hook
    handleSubmit(e)
  }

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(conversationId)
    }
  }

  // Handle conversation renaming
  const handleRenameConversation = async (conversationId, e) => {
    e.stopPropagation()
    setEditingConversationId(conversationId)
    const conversation = conversations.find(c => c.id === conversationId)
    setEditingName(conversation?.name || '')
  }

  const saveConversationName = async () => {
    if (editingConversationId && editingName.trim()) {
      await updateConversationName(editingConversationId, editingName.trim())
    }
    setEditingConversationId(null)
    setEditingName('')
  }

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract code from AI messages when messages change
  useEffect(() => {
    const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop()
    if (lastAssistantMessage) {
      const extractedCode = extractCodeFromMessage(lastAssistantMessage.content)
      if (extractedCode) {
        setGeneratedCode(extractedCode)
      }
    }
  }, [messages])

  // Get current code to display
  const getCurrentCode = () => {
    if (selectedTemplate) {
      return selectedTemplate.code
    }
    return generatedCode
  }

  const currentCode = getCurrentCode()

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">JSX Smith - AI Code Assistant</h1>
          <p className="text-sm text-muted-foreground">Generate React components instantly</p>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{session.user.email}</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn()}>Sign In</Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Conversations */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-sidebar text-sidebar-foreground flex flex-col border-r">
            {/* Conversations Header */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Conversations</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleNewConversation}
                  disabled={!session}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {loading ? (
                  <div className="text-center text-muted-foreground py-4">
                    <div className="text-sm">Loading conversations...</div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No conversations yet</div>
                    {session && (
                      <div className="text-xs mt-1">Click + to start</div>
                    )}
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                        currentConversation?.id === conversation.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent/50'
                      }`}
                      onClick={() => handleConversationSelect(conversation.id)}
                    >
                      {editingConversationId === conversation.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-6 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveConversationName()
                              if (e.key === 'Escape') setEditingConversationId(null)
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={saveConversationName}>
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium truncate pr-8">
                            {conversation.name || 'Untitled Conversation'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {conversation._count?.chats || 0} messages
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => handleRenameConversation(conversation.id, e)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel - Chat Interface */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50} className="bg-card flex flex-col border-r">
            {/* Template Quick Actions */}
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Templates</h3>
              <div className="space-y-2">
                {codeTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template)
                      setActiveTab("preview")
                    }}
                    className="w-full text-left p-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Code className="h-8 w-8 mx-auto mb-3" />
                      <p className="text-sm">Start a conversation to generate code</p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-4"
                          : "bg-muted mr-4"
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">
                        {message.role === "user" ? "You" : "AI"}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-muted mr-4 p-3 rounded-lg">
                      <div className="text-xs opacity-70 mb-1">AI</div>
                      <div className="text-sm">Generating code...</div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Input Form */}
            <div className="p-4 border-t">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Describe the component you want..."
                  className="flex-1"
                  disabled={!session}
                />
                <Button type="submit" size="icon" disabled={isLoading || !session}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              {!session && (
                <p className="text-xs text-muted-foreground mt-2">
                  Please sign in to start generating code
                </p>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Preview/Code Area */}
          <ResizablePanel defaultSize={45} className="flex flex-col bg-card">
            <div className="border-b p-4">
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
                  <div className="h-full bg-card">
                    {currentCode || defaultCode ? (
                      <Iframe
                        code={currentCode || defaultCode}
                        className="w-full h-full border-0"
                        title="React Component Preview"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p>Ask the AI to generate React code to see the preview here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="code" className="h-full m-0">
                  <div className="h-full bg-muted relative">
                    <div className="absolute top-4 right-4 z-10">
                      {(currentCode || defaultCode) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(currentCode || defaultCode)}
                          className="flex items-center gap-2 bg-card/80 backdrop-blur-sm"
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
                          padding: "1rem",
                          paddingTop: "3rem",
                          height: "100%",
                          overflow: "auto",
                        }}
                      >
                        {currentCode || defaultCode}
                      </SyntaxHighlighter>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
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
  )
}
