import { type NextRequest, NextResponse } from "next/server"
import { findOne, updateOne, insertOne } from "@/lib/mongodb-service"

export async function GET() {
  try {
    // We only have one diretoria document
    const diretoria = await findOne("diretoria", {})

    return NextResponse.json(diretoria || {})
  } catch (error) {
    console.error("Error fetching diretoria:", error)
    return NextResponse.json({ error: "Failed to fetch diretoria" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Check if diretoria document exists
    const existing = await findOne("diretoria", {})

    if (existing) {
      // Remove _id from data to prevent MongoDB error
      const { _id, ...updateData } = data

      // Update existing document
      await updateOne("diretoria", { _id: existing._id }, updateData)
    } else {
      // Create new document
      await insertOne("diretoria", data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating diretoria:", error)
    return NextResponse.json({ error: "Failed to update diretoria" }, { status: 500 })
  }
}
