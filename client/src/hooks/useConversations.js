import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export function useConversations() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch all conversations
  const fetchConversations = async () => {
    if (!session) return

    try {
      setLoading(true)
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  // Create new conversation
  const createConversation = async (name) => {
    if (!session) return null

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        const data = await response.json()
        const newConversation = data.conversation
        setConversations(prev => [newConversation, ...prev])
        setCurrentConversation(newConversation)
        toast.success('New conversation created')
        return newConversation
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to create conversation')
    }
    return null
  }

  // Load specific conversation
  const loadConversation = async (conversationId) => {
    if (!session) return null

    try {
      setLoading(true)
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentConversation(data.conversation)
        return data.conversation
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Failed to load conversation')
    } finally {
      setLoading(false)
    }
    return null
  }

  // Save chat message
  const saveChatMessage = async (conversationId, role, message, jsxCode = null, cssCode = null) => {
    if (!session) return null

    try {
      const response = await fetch(`/api/conversations/${conversationId}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, message, jsxCode, cssCode }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.chat
      }
    } catch (error) {
      console.error('Error saving chat:', error)
      toast.error('Failed to save message')
    }
    return null
  }

  // Delete conversation
  const deleteConversation = async (conversationId) => {
    if (!session) return false

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null)
        }
        toast.success('Conversation deleted')
        return true
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
    return false
  }

  // Update conversation name
  const updateConversationName = async (conversationId, name) => {
    if (!session) return false

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId ? { ...conv, name } : conv
        ))
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(prev => ({ ...prev, name }))
        }
        toast.success('Conversation renamed')
        return true
      }
    } catch (error) {
      console.error('Error updating conversation:', error)
      toast.error('Failed to rename conversation')
    }
    return false
  }

  // Load conversations when user logs in
  useEffect(() => {
    if (session) {
      fetchConversations()
    }
  }, [session])

  return {
    conversations,
    currentConversation,
    loading,
    createConversation,
    loadConversation,
    saveChatMessage,
    deleteConversation,
    updateConversationName,
    refreshConversations: fetchConversations,
    setCurrentConversation
  }
}
