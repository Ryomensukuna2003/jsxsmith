import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system:
      "You are a helpful React code assistant. When users ask for React components or code, provide clean, functional React code that can be rendered directly. Always include proper imports and make sure the code is complete and runnable.",
  })

  return result.toDataStreamResponse();
}
