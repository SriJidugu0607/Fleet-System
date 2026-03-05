import { prisma } from "@/lib/prisma"
import { getSupabaseServer } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { addMaintenance } from "../../maintenance-actions"

export default async function Maintenance() {
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

  const maintenances = await prisma.maintenance.findMany({
    where: { companyId: dbuser!.companyId },
    include: { vehicle: true },
    orderBy: { date: "desc" },
  })

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">🔧 Maintenance</h1>

      {/* Add Maintenance */}
      <h2 className="text-lg font-semibold mb-2">Add Maintenance</h2>

      <form action={addMaintenance} className="mb-8 space-x-2">

        <select name="vehicleId" required className="border px-2 py-1">
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicleNo}
            </option>
          ))}
        </select>

        <input
          name="type"
          placeholder="Type (Service, Repair)"
          required
          className="border px-2 py-1"
        />

        <input
          name="cost"
          type="number"
          placeholder="Cost"
          required
          className="border px-2 py-1"
        />

        <button className="bg-green-600 text-white px-3 py-1 rounded">
          Add
        </button>
      </form>

      {/* Maintenance History */}
      <h2 className="text-lg font-semibold mb-2">Maintenance History</h2>

      <table className="w-full bg-white">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Type</th>
            <th>Cost</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {maintenances.map((m) => (
            <tr key={m.id}>
              <td>{m.vehicle.vehicleNo}</td>
              <td>{m.type}</td>
              <td>₹ {m.cost}</td>
              <td>{new Date(m.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}