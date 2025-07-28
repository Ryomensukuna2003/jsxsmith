import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Save a chat message and optionally code snapshot
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id
    const { role, message, jsxCode, cssCode } = await request.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: user.id 
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Create chat message
    const chat = await prisma.chat.create({
      data: {
        conversationId,
        role,
        message
      }
    })

    // If there's code, create a code snapshot
    let codeSnapshot = null
    if (jsxCode || cssCode) {
      codeSnapshot = await prisma.codeSnapshot.create({
        data: {
          conversationId,
          chatId: chat.id,
          jsxCode,
          cssCode
        }
      })
    }

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ 
      chat: {
        ...chat,
        codeSnapshot
      }
    })
  } catch (error) {
    console.error('Error saving chat:', error)
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 })
  }
}
