'use server'

import { prisma } from '@/lib/prisma'

export async function updateLocation(formData: FormData) {
  const tripId = formData.get('tripId') as string
  const location = formData.get('location') as string

  await prisma.trip.update({
    where: { id: tripId },
    data: {
      currentLocation: location,
    },
  })
}
