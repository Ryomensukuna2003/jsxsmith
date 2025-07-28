"use client"

// Third-party libraries
import { useChat } from "ai/react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import Markdown from 'react-markdown'
import { Send, Code, Eye, Copy, Check, ImagePlus } from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useSession, signIn } from "next-auth/react"
import { codeTemplates, defaultCode } from "@/lib/codeTemplates"
import { useConversations } from "@/hooks/useConversations"
import { extractCodeFromMessage, generateConversationName, formatMessagesForAI } from "@/lib/conversationUtils"

// Components
import { toast } from "sonner"
import NavBar from "@/components/navBar"
import Iframe from "@/components/iframe"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"


export default function AICodeInterface() {
  const { data: session } = useSession();
  const { theme } = useTheme()
  const [selectedImage, setSelectedImage] = useState(null)

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
  // const [editingConversationId, setEditingConversationId] = useState(null)
  // const [editingName, setEditingName] = useState("")

  // Initialize chat with conversation messages
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      conversationId: currentConversation?.id,
      image: selectedImage?.dataUrl // Add image data to the request
    },
    onFinish: async (message) => {
      // Save AI response to database
      if (currentConversation) {
        const extractedCode = extractCodeFromMessage(message.content)
        await saveChatMessage(currentConversation.id, 'ai', message.content, extractedCode)
      }
      // Clear image after AI responds
      setSelectedImage(null)
    },
    onError: (error) => {
      console.error('Chat error:', error)
      toast.error("Failed to generate code. Please try again.")
      setSelectedImage(null) // Clear image on error too
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
      setSelectedImage(null) // Clear selected image
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

    // Prepare message content
    let messageContent = input
    if (selectedImage) {
      messageContent += `\n\n[Image: ${selectedImage.name}]`
    }

    // Save user message to database
    await saveChatMessage(conversation.id, 'user', messageContent)

    // Add image info to the message before sending
    if (selectedImage) {
      // Temporarily store the image in the message for display
      const messageWithImage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        image: selectedImage
      }

      // Add to messages for display
      setMessages(prev => [...prev, messageWithImage])
    }

    // Use the handleSubmit from useChat hook (image is sent via body in useChat config)
    handleSubmit(e)
  }

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId, e) => {
    e?.stopPropagation() // Use optional chaining to handle cases where e is undefined
    if (confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(conversationId)
    }
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
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          conversations={conversations}
          currentConversation={currentConversation}
          loading={loading}
          session={session}
          onNewConversation={handleNewConversation}
          onConversationSelect={handleConversationSelect}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={updateConversationName}
        />

        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <NavBar />
          {/* Main Content Area */}
          <div className="flex-1 min-h-0">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Chat Interface Panel */}
              <ResizablePanel defaultSize={35} minSize={25} maxSize={50} className="bg-card flex flex-col border-r">
                {/* Template Quick Actions */}
                {/* <div className="p-4 border-b">
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
                </div> */}

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
                      {messages.map((message, index) => (
                        <div
                          key={message.id || `message-${index}`}
                          className={`p-3 rounded-lg ${message.role === "user"
                            ? "bg-primary text-primary-foreground ml-4"
                            : "bg-muted mr-4"
                            }`}
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {message.role === "user" ? "You" : "AI"}
                          </div>

                          {/* Show image if present */}
                          {message.image && (
                            <div className="mb-2">
                              <img
                                src={message.image.dataUrl}
                                alt={message.image.name}
                                className="max-w-48 max-h-32 object-cover rounded border"
                              />
                            </div>
                          )}

                          <div className="text-wrap text-sm">
                            <Markdown
                              children={message.content}
                              components={{
                                code(props) {
                                  const { children, className, node, ...rest } = props
                                  const match = /language-(\w+)/.exec(className || '')
                                  return match ? (
                                    <SyntaxHighlighter
                                      {...rest}
                                      PreTag="div"
                                      children={String(children).replace(/\n$/, '')}
                                      language={match[1]}
                                      style={theme === 'dark' ? oneDark : oneLight}
                                    />
                                  ) : (
                                    <code {...rest} className={className}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            />
                          </div>
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
                  {/* Show selected image preview */}
                  {selectedImage && (
                    <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded">
                      <img src={selectedImage.dataUrl} alt="" className="h-8 w-8 object-cover rounded" />
                      <span className="text-sm">{selectedImage.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedImage(null)}
                        className="ml-auto h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Describe the component you want..."
                      className="flex-1"
                      disabled={!session}
                    />

                    {/* File input button */}
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="icon" disabled={!session} asChild>
                        <span>
                          <ImagePlus className="h-4 w-4" />
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (e) => {
                              setSelectedImage({
                                file,
                                name: file.name,
                                dataUrl: e.target.result
                              })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        disabled={!session}
                      />
                    </label>

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
                            style={theme === 'dark' ? oneDark : oneLight}
                            className="text-sm"
                            showLineNumbers
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}