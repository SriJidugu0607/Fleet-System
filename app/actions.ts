'use server'

import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from "next/cache"

export async function addVehicle(formData: FormData) {

  const supabase = await getSupabaseServer()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) throw new Error('Not authenticated')

  const dbuser = await prisma.user.findUnique({
    where: { authId: authUser.id },
  })

  if (!dbuser) throw new Error('User missing')

  const vehicleNo = formData.get('vehicleNo') as string
  const type = formData.get('type') as string
  const transport = formData.get('transport') as string | null

  // ✅ check duplicate
  const existing = await prisma.vehicle.findFirst({
    where: {
      vehicleNo,
      companyId: dbuser.companyId
    }
  })

  if (existing) {
    return { error: "Vehicle already exists" }
  }

  await prisma.vehicle.create({
    data: {
      vehicleNo,
      type,
      transport,
      companyId: dbuser.companyId,
    },
  })

  revalidatePath("/vehicles")
  revalidatePath("/dashboard")

  return { success: true }
}