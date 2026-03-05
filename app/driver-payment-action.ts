'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function payDriver(formData: FormData) {

  const driverId = formData.get("driverId") as string
  const amount = Number(formData.get("amount"))

  await prisma.driverPayment.create({
    data: {
      driverId,
      amount,
      companyId: "your-company-id",
    },
  })

  // update last payment date
  await prisma.driver.update({
    where: { id: driverId },
    data: {
      lastPaymentDate: new Date(),
    },
  })

  revalidatePath("/settlements")
  revalidatePath("/dashboard")

}



/*
  'use server'

import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function payDriver(formData: FormData) {
  const supabase = await getSupabaseServer()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) throw new Error('Not authenticated')

  const dbuser = await prisma.user.findUnique({
    where: { authId: authUser.id },
  })

  if (!dbuser) throw new Error('User missing')

  const driverId = formData.get('driverId') as string
  const amount = Number(formData.get('amount'))

  await prisma.driverPayment.create({
  data: {
    driverId,
    amount,
    companyId: dbuser.companyId,
  },
})

// update driver payment date
await prisma.driver.update({
  where: { id: driverId },
  data: {
    lastPaymentDate: new Date(),
  },
})
}

*/