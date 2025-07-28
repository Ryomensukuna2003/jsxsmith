// Utility function to extract JSX code from AI message content
export function extractCodeFromMessage(content) {
  if (!content) return null
  
  // Look for JSX/TSX code blocks
  const jsxMatch = content.match(/```(?:jsx?|tsx?)\n([\s\S]*?)\n```/)
  if (jsxMatch) {
    return jsxMatch[1].trim()
  }
  
  // Look for generic code blocks that might contain JSX
  const codeMatch = content.match(/```\n([\s\S]*?)\n```/)
  if (codeMatch) {
    const code = codeMatch[1].trim()
    // Simple heuristic to check if it's likely JSX
    if (code.includes('function ') && code.includes('return (')) {
      return code
    }
  }
  
  return null
}

// Utility function to format conversation name from first message
export function generateConversationName(firstMessage) {
  if (!firstMessage) return 'New Conversation'
  
  // Take first 50 characters and clean it up
  const name = firstMessage
    .trim()
    .slice(0, 50)
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
  
  return name || 'New Conversation'
}

// Utility function to format messages for AI API
export function formatMessagesForAI(chats) {
  return chats.map(chat => ({
    role: chat.role === 'ai' ? 'assistant' : chat.role,
    content: chat.message
  }))
}
