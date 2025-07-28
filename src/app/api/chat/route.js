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

    const { messages, conversationId, image } = await req.json()

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

    // Process messages for Gemini (handle image if present)
    let processedMessages = messages

    // If there's an image, convert the last user message to include the image
    if (image) {
      processedMessages = messages.map((msg, index) => {
        // If this is the last user message, add the image
        if (msg.role === 'user' && index === messages.length - 1) {
          return {
            role: 'user',
            content: [
              {
                type: 'text',
                text: msg.content
              },
              {
                type: 'image',
                image: image // base64 image data
              }
            ]
          }
        }
        return msg
      })
    }

    const result = streamText({
      model: google("gemini-2.0-flash-lite", {
        // The API key is automatically picked up from GOOGLE_GENERATIVE_AI_API_KEY
      }),
      messages: processedMessages,
      system: image
        ? "You are a helpful React code assistant with vision capabilities. When users provide images along with their requests, analyze the image carefully and create React components based on what you see. When users ask for React components or code, provide clean, functional React code that can be rendered directly. Always use Tailwind CSS for styling. Make sure the code is complete, runnable, and compatible with iframe environments. Include proper imports and ensure all dependencies are correctly specified. If an image shows a UI design or mockup, recreate it as closely as possible with React and Tailwind CSS."
        : "You are a helpful React code assistant. When users ask for React components or code, provide clean, functional React code that can be rendered directly. Always use Tailwind CSS for styling. Make sure the code is complete, runnable, and compatible with iframe environments. Include proper imports and ensure all dependencies are correctly specified.",
    })

    return result.toDataStreamResponse()

  } catch (error) {
    console.error("API Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}