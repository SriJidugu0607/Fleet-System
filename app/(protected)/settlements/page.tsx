import { prisma } from "@/lib/prisma"
import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function Settlements() {

  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const dbuser = await prisma.user.findUnique({
    where: { authId: user.id },
  })

  const completedTrips = await prisma.trip.findMany({
    where: {
      companyId: dbuser!.companyId,
      status: "COMPLETED",
    },
    include: {
      driver: true,
      expenses: true,
    },
  })

  const DRIVER_PERCENT = 0.1

  const driverMap: Record<string, any> = {}

  completedTrips.forEach((trip) => {

    const expenseTotal = trip.expenses.reduce(
      (sum, e) => sum + e.amount,
      0
    )

    if (!driverMap[trip.driverId]) {
      driverMap[trip.driverId] = {
        driverName: trip.driver.name,
        trips: 0,
        freight: 0,
        expenses: 0,
      }
    }

    driverMap[trip.driverId].trips += 1
    driverMap[trip.driverId].freight += trip.freight
    driverMap[trip.driverId].expenses += expenseTotal

  })

  const settlements = Object.entries(driverMap).map(
    ([driverId, d]: any) => {

      const share = d.freight * DRIVER_PERCENT
      const payable = share - d.expenses

      return {
        driverId,
        ...d,
        share,
        payable,
      }

    }
  )

  return (

    <div>

      <h1 className="text-2xl font-bold mb-6">
        💰 Driver Settlements
      </h1>

      <table className="w-full bg-white">

        <thead>
          <tr>
            <th>Driver</th>
            <th>Trips</th>
            <th>Total Freight</th>
            <th>Driver Share</th>
            <th>Expenses</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>

          {settlements.map((d: any) => (

            <tr key={d.driverId}>

              <td>{d.driverName}</td>

              <td>{d.trips}</td>

              <td>₹ {d.freight}</td>

              <td>₹ {d.share}</td>

              <td>₹ {d.expenses}</td>

              <td
                style={{
                  color: d.payable >= 0 ? "green" : "red",
                }}
              >
                ₹ {d.payable}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )
}