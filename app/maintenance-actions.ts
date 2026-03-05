'use server'

import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function addMaintenance(formData: FormData) {
  const supabase = await getSupabaseServer()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) throw new Error('Not authenticated')

  const dbuser = await prisma.user.findUnique({
    where: { authId: authUser.id },
  })

  if (!dbuser) throw new Error('User missing')

  await prisma.maintenance.create({
    data: {
      vehicleId: formData.get('vehicleId') as string,
      type: formData.get('type') as string,
      cost: Number(formData.get('cost')),
      companyId: dbuser.companyId,
    },
  })
  revalidatePath("/maintenance")
  revalidatePath("/dashboard")
}
