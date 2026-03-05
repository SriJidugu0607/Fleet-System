import { prisma } from "@/lib/prisma"
import VehicleSelector from "./vehicle-selector"

export default async function Reports() {

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { vehicleNo: "asc" }
  })

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        📄 Monthly Reports
      </h1>

      <form action="/api/report" method="GET">

        <div className="mb-4">
          <label>Month</label>
          <br />

          <input
            type="month"
            name="month"
            required
            className="border px-2 py-1"
          />
        </div>

        <VehicleSelector vehicles={vehicles} />

        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
          Download Report
        </button>

      </form>

    </div>
  )
}