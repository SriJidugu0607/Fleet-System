"use client"

import { useState } from "react"

type Vehicle = {
  id: string
  vehicleNo: string
  transport: string | null
}

export default function VehicleSelector({ vehicles }: { vehicles: Vehicle[] }) {

  const [search, setSearch] = useState("")

  const transports = Array.from(
    new Set(vehicles.map(v => v.transport).filter(Boolean))
  )

  const filteredVehicles = vehicles.filter(v =>
    v.vehicleNo.toLowerCase().includes(search.toLowerCase())
  )

  function selectAll() {
    document.querySelectorAll<HTMLInputElement>('input[name="vehicleIds"]')
      .forEach(cb => cb.checked = true)
  }

  function clearAll() {
    document.querySelectorAll<HTMLInputElement>('input[name="vehicleIds"]')
      .forEach(cb => cb.checked = false)
  }

  function selectTransport(transport: string) {
    document.querySelectorAll<HTMLInputElement>('input[name="vehicleIds"]')
      .forEach(cb => {
        if (cb.dataset.transport === transport) {
          cb.checked = true
        }
      })
  }

  return (
    <div>

      {/* Search Box */}
      <div className="mb-3">
        <input
          placeholder="Search vehicle number..."
          className="border px-3 py-1 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Transport Buttons */}
      <div className="mb-3 flex gap-2 flex-wrap">

        {transports.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => selectTransport(t!)}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            {t}
          </button>
        ))}

        <button
          type="button"
          onClick={selectAll}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Select All
        </button>

        <button
          type="button"
          onClick={clearAll}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Clear
        </button>

      </div>

      {/* Vehicle List */}
      <div className="border p-3 max-h-60 overflow-y-auto space-y-2">

        {filteredVehicles.map(v => (
          <label key={v.id} className="flex items-center gap-2">

            <input
              type="checkbox"
              name="vehicleIds"
              value={v.id}
              data-transport={v.transport ?? ""}
            />

            {v.vehicleNo}
            {v.transport ? ` (${v.transport})` : ""}

          </label>
        ))}

      </div>

    </div>
  )
}