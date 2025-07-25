import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, name, image } = session.user

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    })

    if (existingUser) {
      return NextResponse.json({ user: existingUser })
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        image: image,
      }
    })

    return NextResponse.json({ user: newUser, isNewUser: true })
  } catch (error) {
    console.error('Error storing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
