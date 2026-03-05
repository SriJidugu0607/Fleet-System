'use server'

import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function addExpense(formData: FormData) {
  const supabase = await getSupabaseServer()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) throw new Error('Not authenticated')

  const dbuser = await prisma.user.findUnique({
    where: { authId: authUser.id },
  })

  if (!dbuser) throw new Error('User missing')

  await prisma.expense.create({
    data: {
      tripId: formData.get('tripId') as string,
      type: formData.get('type') as string,
      amount: Number(formData.get('amount')),
      companyId: dbuser.companyId,   // 🔴 IMPORTANT (multi-tenant)
    },
  })
}
