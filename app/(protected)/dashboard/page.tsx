import { prisma } from '@/lib/prisma'
import { getSupabaseServer } from '@/lib/supabase-server'

import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { logout } from '@/app/logout-action'
import { translations } from "@/lib/translations"
import LanguageSwitcher from "@/components/LanguageSwitcher"


export default async function Home() {
  noStore()

  const supabase = await getSupabaseServer()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const authUserId = authUser.id
  const email = authUser.email!

  let dbuser = await prisma.user.findUnique({
    where: { authId: authUserId },
  })

  if (!dbuser) {
    const company = await prisma.company.create({
      data: { name: `${email}'s Company` },
    })

    dbuser = await prisma.user.create({
      data: {
        authId: authUserId,
        email,
        companyId: company.id,
      },
    })
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { companyId: dbuser.companyId },
  })

  const drivers = await prisma.driver.findMany({
    where: { companyId: dbuser.companyId },
  })

  const activeTrips = await prisma.trip.findMany({
    where: {
      companyId: dbuser.companyId,
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
    include: {
      vehicle: true,
      driver: true,
      expenses: true,
    },
  })

  const completedTrips = await prisma.trip.findMany({
    where: {
      companyId: dbuser.companyId,
      status: "COMPLETED",
    },
    include: {
      vehicle: true,
      driver: true,
      expenses: true,
    },
  })

  const maintenances = await prisma.maintenance.findMany({
    where: { companyId: dbuser.companyId },
    include: { vehicle: true },
  })

  const now = new Date()

  const currentMonthTrips = completedTrips.filter(t => {
    const d = new Date(t.tripDate)
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  })

  const monthlyFreight = currentMonthTrips.reduce((sum, t) => sum + t.freight, 0)

  const monthlyTripExpense = currentMonthTrips.reduce(
    (sum, t) => sum + t.expenses.reduce((eSum, e) => eSum + e.amount, 0),
    0
  )

  const monthlyMaintenance = maintenances.reduce((sum, m) => sum + m.cost, 0)

  const monthlyProfit =
    monthlyFreight - monthlyTripExpense - monthlyMaintenance

  const totalVehicles = vehicles.length
  const activeTripCount = activeTrips.length
  const completedTripCount = completedTrips.length

  const avgProfitPerTrip =
    completedTrips.length === 0
      ? 0
      : Math.round(monthlyProfit / completedTrips.length)

  const totalExpensesThisMonth =
    monthlyTripExpense + monthlyMaintenance

  const paymentAlerts = await prisma.driver.findMany({
    where: {
      lastPaymentDate: {
        lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      companyId: dbuser.companyId,
    },
  })

  const upcomingPayments = await prisma.recurringPayment.findMany({
    where: {
      companyId: dbuser.companyId,
      dueDate: {
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      vehicle: true,
    },
  })

  return (
    <main className="p-6 md:p-10 bg-gray-100 text-gray-800 min-h-screen">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

  <h1 className="text-3xl font-bold text-gray-800">
    🚛 Smart Transport Dashboard
  </h1>

  <div className="flex gap-3 items-center">

    

    <form action={logout}>
      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow">
        Logout
      </button>
    </form>

  </div>

</div>

      <hr className="mb-6 border-white/40" />

      {/* KPI Cards */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">

  <div className="bg-white p-6 rounded-xl shadow border text-center">

  <div className="text-3xl mb-2">🚚</div>

  <div className="text-gray-500 text-sm">
    Total Trucks
  </div>

  <div className="text-2xl font-bold text-blue-600">
    {totalVehicles}
  </div>

</div>
  <div className="bg-white text-black p-5 rounded shadow text-center">
    <div className="text-3xl">📦</div>
    <div className="text-sm text-gray-500">Trips Running</div>
    <div className="text-2xl font-bold">{activeTripCount}</div>
  </div>

  <div className="bg-white text-black p-5 rounded shadow text-center">
    <div className="text-3xl">✅</div>
    <div className="text-sm text-gray-500">Trips Finished</div>
    <div className="text-2xl font-bold">{completedTripCount}</div>
  </div>

  <div className="bg-white text-black p-5 rounded shadow text-center">
    <div className="text-3xl">💰</div>
    <div className="text-sm text-gray-500">Profit / Trip</div>
    <div className="text-2xl font-bold">RS {avgProfitPerTrip}</div>
  </div>

  <div className="bg-white text-black p-5 rounded shadow text-center">
    <div className="text-3xl">⚙</div>
    <div className="text-sm text-gray-500">Expenses</div>
    <div className="text-2xl font-bold">RS {totalExpensesThisMonth}</div>
  </div>

</div>

      {/* Monthly Summary */}
<h2 className="text-xl font-semibold mb-3">Monthly Summary</h2>

<div className="overflow-x-auto mb-8">

<table className="min-w-full bg-white rounded-xl shadow border overflow-hidden">
<tbody>

<tr>
<td className="px-4 py-3 border-b font-medium">
Total Freight
</td>

<td className="px-4 py-3 border-b text-gray-700">
RS {monthlyFreight}
</td>
</tr>

<tr>
<td className="px-4 py-3 border-b font-medium">
Trip Expenses
</td>

<td className="px-4 py-3 border-b text-gray-700">
RS {monthlyTripExpense}
</td>
</tr>

<tr>
<td className="px-4 py-3 border-b font-medium">
Maintenance
</td>

<td className="px-4 py-3 border-b text-gray-700">
RS {monthlyMaintenance}
</td>
</tr>

<tr>
<td className="px-4 py-3 border-b text-gray-700">
Net Profit
</td>

<td className="px-4 py-3 border-b text-gray-700">
<span className={monthlyProfit >= 0 ? "text-green-600" : "text-red-600"}>
RS {monthlyProfit}
</span>
</td>

</tr>

</tbody>

</table>

</div>

      {/* Vehicles */}
      <h2 className="text-xl font-semibold mb-3">Vehicles</h2>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded-xl shadow border overflow-hidden">
          <thead>
          <tr>
          <th className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">Vehicle No</th>
          <th className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">Type</th>
          <th className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">Status</th>
          </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-b text-gray-700">{v.vehicleNo}</td>
                <td className="px-4 py-3 border-b text-gray-700">{v.type}</td>
                <td className="px-4 py-3 border-b text-gray-700">{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drivers */}
      <h2 className="text-xl font-semibold mb-3">Drivers</h2>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded-xl shadow border overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left bg-gray-100 border-b">Name</th>
              <th className="px-4 py-3 text-left bg-gray-100 border-b">Phone</th>
              <th className="px-4 py-3 text-left bg-gray-100 border-b">License</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id}>
                <td className="px-4 py-3 border-b text-gray-700">{d.name}</td>
                <td className="px-4 py-3 border-b text-gray-700">{d.phone}</td>
                <td className="px-4 py-3 border-b text-gray-700">{d.licenseNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live Trips */}
      <h2 className="text-xl font-semibold mb-3">📡 Live Truck Status</h2>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded-xl shadow border overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">Vehicle</th>
              <th className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">Driver</th>
              <th className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">Route</th>
              <th className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">Location</th>
              <th className="px-4 py-3 bg-gray-50 text-gray-700 text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {activeTrips.map(trip => (
              <tr key={trip.id}>
                <td className="px-4 py-3 border-b text-gray-700">{trip.vehicle.vehicleNo}</td>
                <td className="px-4 py-3 border-b text-gray-700">{trip.driver.name}</td>
                <td className="px-4 py-3 border-b text-gray-700">
                  {trip.origin} → {trip.destination}
                </td>
                <td className="px-4 py-3 border-b text-gray-700">
                  {trip.currentLocation ?? "—"}
                </td>
                <td className="px-4 py-3 border-b text-gray-700">{trip.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Driver Alerts */}
      <h2 className="text-xl font-semibold mt-10 mb-3">
        💰 Driver Payment Alerts
      </h2>

      {paymentAlerts.length === 0 && (
        <p>No pending driver payments</p>
      )}

      {paymentAlerts.map(d => (
        <div
          key={d.id}
          className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg mb-3"
        >
          {d.name} payment due
        </div>
      ))}

      {/* Upcoming Payments */}
      <h2 className="text-xl font-semibold mt-10 mb-3">
        💳 Upcoming Payments
      </h2>

      {upcomingPayments.length === 0 && (
        <p>No upcoming payments</p>
      )}

      {upcomingPayments.map(p => (
        <div
          key={p.id}
          className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg mb-3"
        >
          <b>{p.title}</b>
          {p.vehicle && <> ({p.vehicle.vehicleNo})</>}
          {" "} due on {new Date(p.dueDate).toLocaleDateString()}
          {" "} — RS {p.amount}
        </div>
      ))}

    </main>
  )
}