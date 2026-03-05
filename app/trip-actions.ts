'use server'

import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from "next/cache"

export async function addTrip(formData: FormData) {
  const supabase = await getSupabaseServer()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) throw new Error('Not authenticated')

  const dbuser = await prisma.user.findUnique({
    where: { authId: authUser.id },
  })

  if (!dbuser) throw new Error('User not found')

  // ✅ Extract values from form
  const vehicleId = formData.get('vehicleId') as string
  const driverId = formData.get('driverId') as string
  const origin = formData.get('origin') as string
  const destination = formData.get('destination') as string
  const freight = Number(formData.get('freight'))

  // ✅ Create trip with LIVE status
  await prisma.trip.create({
    data: {
      vehicleId,
      driverId,
      origin,
      destination,
      freight,
      companyId: dbuser.companyId,

      // ⭐ live tracking fields
      status: 'OPEN',
      startedAt: new Date(),
      currentLocation: origin,
    },
  })
  revalidatePath("/trips")
  revalidatePath("/dashboard")
}
