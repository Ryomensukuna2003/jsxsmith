import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, MessageSquare, Edit, Trash2, Check } from "lucide-react"

export function ConversationSidebar({
  conversations,
  currentConversation,
  loading,
  session,
  onNewConversation,
  onConversationSelect,
  onDeleteConversation,
  onRenameConversation
}) {
  const [editingConversationId, setEditingConversationId] = useState(null)
  const [editingName, setEditingName] = useState("")

  const handleRename = (conversationId, e) => {
    e.stopPropagation()
    setEditingConversationId(conversationId)
    const conversation = conversations.find(c => c.id === conversationId)
    setEditingName(conversation?.name || '')
  }

  const saveConversationName = async () => {
    if (editingConversationId && editingName.trim()) {
      await onRenameConversation(editingConversationId, editingName.trim())
    }
    setEditingConversationId(null)
    setEditingName('')
  }

  const handleDelete = (conversationId, e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation(conversationId)
    }
  }

  return (
    <div className="bg-sidebar text-sidebar-foreground flex flex-col border-r h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Conversations</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNewConversation}
            disabled={!session}
            className="h-8 w-8 p-0"
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
                onClick={() => onConversationSelect(conversation.id)}
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
                        onClick={(e) => handleRename(conversation.id, e)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleDelete(conversation.id, e)}
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
    </div>
  )
}
