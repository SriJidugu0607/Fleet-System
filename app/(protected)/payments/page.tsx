import { prisma } from "@/lib/prisma"

export default async function Payments() {

  const payments = await prisma.recurringPayment.findMany({
    include: { vehicle: true }
  })

  return (
    <div>

      <h1 className="text-2xl font-bold mb-6">
        💰 Recurring Payments
      </h1>

      <table className="border w-full">

        <thead>
          <tr>
            <th>Title</th>
            <th>Vehicle</th>
            <th>Amount</th>
            <th>Frequency</th>
            <th>Next Due</th>
          </tr>
        </thead>

        <tbody>

          {payments.map(p => (
            <tr key={p.id}>

              <td>{p.title}</td>
              <td>{p.vehicle?.vehicleNo ?? "-"}</td>
              <td>₹ {p.amount}</td>
              <td>{p.frequency}</td>
              <td>{new Date(p.dueDate).toLocaleDateString()}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}