'use server'   // ✅ MUST be first line — no spaces, no comments above

import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function addDriver(formData: FormData) {
  const supabase = await getSupabaseServer()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) throw new Error('Not authenticated')

  const dbuser = await prisma.user.findUnique({
    where: { authId: authUser.id },
  })

  if (!dbuser) throw new Error('User missing')

  await prisma.driver.create({
    data: {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      licenseNo: formData.get('licenseNo') as string,
      companyId: dbuser.companyId,
    },
  })
}
