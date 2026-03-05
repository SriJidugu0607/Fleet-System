import { prisma } from "@/lib/prisma"
import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { addTrip } from "../../trip-actions"
import { completeTrip } from "../../complete-trip-action"

export default async function Trips() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const dbuser = await prisma.user.findUnique({
    where: { authId: user.id },
  })

  const vehicles = await prisma.vehicle.findMany({
    where: { companyId: dbuser!.companyId },
  })

  const drivers = await prisma.driver.findMany({
    where: { companyId: dbuser!.companyId },
  })

  const trips = await prisma.trip.findMany({
    where: { companyId: dbuser!.companyId },
    include: {
      vehicle: true,
      driver: true,
    },
  })

  const activeTrips = trips.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
  )

  const completedTrips = trips.filter((t) => t.status === "COMPLETED")

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">🚚 Trips</h1>

      {/* Create Trip */}
      <h2 className="text-lg font-semibold mb-2">Create Trip</h2>

      <form action={addTrip} className="mb-8 space-x-2">

        <select name="vehicleId" required className="border px-2 py-1">
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicleNo}
            </option>
          ))}
        </select>

        <select name="driverId" required className="border px-2 py-1">
          <option value="">Select Driver</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          name="origin"
          placeholder="From"
          required
          className="border px-2 py-1"
        />

        <input
          name="destination"
          placeholder="To"
          required
          className="border px-2 py-1"
        />

        <input
          name="freight"
          type="number"
          placeholder="Freight"
          required
          className="border px-2 py-1"
        />

        <button className="bg-green-600 text-white px-3 py-1 rounded">
          Create Trip
        </button>
      </form>

      {/* Active Trips */}
      <h2 className="text-lg font-semibold mb-2">Active Trips</h2>

      <table className="w-full bg-white mb-8">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Route</th>
            <th>Status</th>
            <th>Complete</th>
          </tr>
        </thead>

        <tbody>
          {activeTrips.map((t) => (
            <tr key={t.id}>
              <td>{t.vehicle.vehicleNo}</td>
              <td>{t.driver.name}</td>
              <td>
                {t.origin} → {t.destination}
              </td>
              <td>{t.status}</td>

              <td>
                <form action={completeTrip}>
                  <input type="hidden" name="tripId" value={t.id} />
                  <button className="bg-blue-600 text-white px-2 py-1 rounded">
                    Complete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Completed Trips */}
      <h2 className="text-lg font-semibold mb-2">Completed Trips</h2>

      <table className="w-full bg-white">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Route</th>
            <th>Freight</th>
          </tr>
        </thead>

        <tbody>
          {completedTrips.map((t) => (
            <tr key={t.id}>
              <td>{t.vehicle.vehicleNo}</td>
              <td>{t.driver.name}</td>
              <td>
                {t.origin} → {t.destination}
              </td>
              <td>₹ {t.freight}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}