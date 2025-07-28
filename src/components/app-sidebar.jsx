"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Plus, MessageSquare, Edit, Trash2, Check, Menu, X } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppSidebar({
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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex-col items-center justify-between">
          <h2 className="text-lg font-semibold px-2 group-data-[collapsible=icon]:hidden">
            Conversations
          </h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNewConversation}
            disabled={!session}
            className="mt-4 w-full group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0"
          >
            <Plus className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:sr-only">New Conversation</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="text-center text-muted-foreground py-4 group-data-[collapsible=icon]:hidden">
                  <div className="text-sm">Loading...</div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 group-data-[collapsible=icon]:hidden">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No conversations yet</div>
                  {session && (
                    <div className="text-xs mt-1">Click + to start</div>
                  )}
                </div>
              ) : (
                conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      onClick={() => onConversationSelect(conversation.id)}
                      isActive={currentConversation?.id === conversation.id}
                      className="group relative w-full justify-start h-12"
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
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
                            <div className="text-xs text-muted-foreground">
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
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
