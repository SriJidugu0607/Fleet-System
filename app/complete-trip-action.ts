'use server'

import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function completeTrip(formData: FormData) {
  const supabase = await getSupabaseServer()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) throw new Error('Not authenticated')

  const dbuser = await prisma.user.findUnique({
    where: { authId: authUser.id },
  })

  if (!dbuser) throw new Error('User not found')

  const tripId = formData.get('tripId') as string

  // ✅ Ensure trip belongs to this company (security!)
  await prisma.trip.updateMany({
    where: {
      id: tripId,
      companyId: dbuser.companyId,
    },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  })
}
