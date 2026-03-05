import { prisma } from '@/lib/prisma'
import { addVehicle } from '../../actions'

export default async function Vehicles() {

  const vehicles = await prisma.vehicle.findMany()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🚛 Vehicles</h1>

<form action={addVehicle} className="flex gap-3 mb-6">

  <input
    name="vehicleNo"
    placeholder="Vehicle Number"
    required
    className="border px-3 py-2"
  />

  <input
    name="type"
    placeholder="Type"
    required
    className="border px-3 py-2"
  />

  <input
    name="transport"
    placeholder="Transport Name"
    className="border px-3 py-2"
  />

  <button className="bg-green-600 text-white px-4 py-1 rounded">
    Add Vehicle
  </button>

</form>

      <table className="w-full bg-white">
        <thead>
          <tr>
            <th>Vehicle No</th>
            <th>Type</th>
            <th>Transport</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td>{v.vehicleNo}</td>
              <td>{v.type}</td>
              <td>{v.transport ?? "-"}</td>
              <td>{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}