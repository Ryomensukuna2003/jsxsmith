import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const maxDuration = 30

export async function POST(req) {
  try {
    // Check if API key exists
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response("Google AI API key not configured", { status: 500 })
    }

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, conversationId } = await req.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    // Verify conversation belongs to user if conversationId provided
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id
        }
      })

      if (!conversation) {
        return new Response("Conversation not found", { status: 404 })
      }
    }

    const result = streamText({
      model: google("gemini-2.0-flash-lite", {
      // The API key is automatically picked up from GOOGLE_GENERATIVE_AI_API_KEY
      }),
      messages,
      system:
      "You are a helpful React code assistant. When users ask for React components or code, provide clean, functional React code that can be rendered directly. Always use Tailwind CSS for styling. Make sure the code is complete, runnable, and compatible with iframe environments. Include proper imports and ensure all dependencies are correctly specified.",
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("API Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
