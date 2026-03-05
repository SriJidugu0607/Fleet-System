import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PDFDocument, StandardFonts } from "pdf-lib"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  const month = searchParams.get("month")
  const vehicleIds = searchParams.getAll("vehicleIds") // multiple vehicles

  if (!month) {
    return NextResponse.json({ error: "Month required" })
  }

  const start = new Date(`${month}-01`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  const trips = await prisma.trip.findMany({
    where: {
      tripDate: {
        gte: start,
        lt: end,
      },
      ...(vehicleIds.length > 0
        ? { vehicleId: { in: vehicleIds } }
        : {}),
    },
    include: {
      vehicle: true,
      driver: true,
      expenses: true,
    },
  })

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([600, 800])
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  let y = 750

  page.drawText("Fleet Monthly Report", {
    x: 50,
    y,
    size: 20,
    font,
  })

  y -= 40

  page.drawText(`Month: ${month}`, {
    x: 50,
    y,
    size: 12,
    font,
  })

  y -= 30

  let totalFreight = 0
  let totalExpense = 0
  let totalProfit = 0

  for (const trip of trips) {

    const expense = trip.expenses.reduce(
      (sum, e) => sum + e.amount,
      0
    )

    const profit = trip.freight - expense

    totalFreight += trip.freight
    totalExpense += expense
    totalProfit += profit

    const line =
      `${trip.vehicle.vehicleNo} | ` +
      `${trip.origin} -> ${trip.destination} | ` +
      `Freight: Rs ${trip.freight} | ` +
      `Expense: Rs ${expense} | ` +
      `Profit: Rs ${profit}`

    page.drawText(line, {
      x: 50,
      y,
      size: 10,
      font,
    })

    y -= 20

    // prevent text overflow
    if (y < 50) {
      y = 750
      pdf.addPage([600, 800])
    }

  }

  y -= 30

  page.drawText(`Total Freight: Rs ${totalFreight}`, {
    x: 50,
    y,
    size: 12,
    font,
  })

  y -= 20

  page.drawText(`Total Expense: Rs ${totalExpense}`, {
    x: 50,
    y,
    size: 12,
    font,
  })

  y -= 20

  page.drawText(`Total Profit: Rs ${totalProfit}`, {
    x: 50,
    y,
    size: 12,
    font,
  })

  const pdfBytes = await pdf.save()

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=fleet-report.pdf",
    },
  })
}