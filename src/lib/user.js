import { prisma } from './prisma'

export async function createAppSession(userId, name = null) {
  try {
    const appSession = await prisma.appSession.create({
      data: {
        userId,
        name,
      },
    })
    return appSession
  } catch (error) {
    console.error('Error creating app session:', error)
    throw error
  }
}

export async function getUserAppSessions(userId) {
  try {
    const sessions = await prisma.appSession.findMany({
      where: {
        userId,
      },
      include: {
        chats: true,
        _count: {
          select: {
            chats: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    return sessions
  } catch (error) {
    console.error('Error fetching user sessions:', error)
    throw error
  }
}

export async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        appSessions: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    })
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
