import { prisma } from "@/lib/prisma"

export default async function Transports() {

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { vehicleNo: "asc" }
  })

  const transports: Record<string, typeof vehicles> = {}

  vehicles.forEach(v => {
    const key = v.transport || "No Transport"

    if (!transports[key]) {
      transports[key] = []
    }

    transports[key].push(v)
  })

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        🚚 Transports
      </h1>

      {Object.entries(transports).map(([transport, vehicles]) => (

        <div key={transport} className="mb-6">

          <h2 className="text-xl font-semibold mb-2">
            {transport}
          </h2>

          <table className="border w-full">

            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Vehicle No</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>

            <tbody>

              {vehicles.map(v => (
                <tr key={v.id} className="border-t">

                  <td className="p-2">{v.vehicleNo}</td>
                  <td className="p-2">{v.type}</td>
                  <td className="p-2">{v.status}</td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      ))}

    </div>
  )
}