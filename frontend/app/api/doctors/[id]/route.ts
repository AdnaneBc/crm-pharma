import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

interface Params {
  params: {
    id: string
  }
}

/*
========================
GET DOCTOR BY ID
========================
*/

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    })

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error("GET DOCTOR ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch doctor" },
      { status: 500 }
    )
  }
}

/*
========================
UPDATE DOCTOR
========================
*/

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
        const { id } = await context.params
    const body = await req.json()

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id},
    })

    if (!existingDoctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      )
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id},
      data: body,
    })

    return NextResponse.json(updatedDoctor)
  } catch (error) {
    console.error("UPDATE DOCTOR ERROR:", error)

    return NextResponse.json(
      { error: "Failed to update doctor" },
      { status: 500 }
    )
  }
}

/*
========================
DELETE DOCTOR
========================
*/

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id},
    })

    if (!existingDoctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      )
    }

    await prisma.doctor.delete({
      where: { id},
    })

    return NextResponse.json({
      message: "Doctor deleted successfully",
    })
  } catch (error) {
    console.error("DELETE DOCTOR ERROR:", error)

    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    )
  }
}