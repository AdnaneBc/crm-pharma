import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

/*
========================
GET ALL DOCTORS
========================
*/

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error("GET DOCTORS ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}

/*
========================
CREATE DOCTOR
========================
*/

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      firstName,
      lastName,
      speciality,
      address,
      phone,
      type,
      organizationId,
      sectorId,
    } = body

    /*
    VALIDATION
    */

    if (!firstName || !lastName || !type || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    /*
    CHECK ORGANIZATION EXISTS
    */

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    /*
    CHECK DUPLICATE DOCTOR
    */

    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        firstName,
        lastName,
        organizationId,
      },
    })

    if (existingDoctor) {
      return NextResponse.json(
        { error: "Doctor already exists in this organization" },
        { status: 409 }
      )
    }

    /*
    CREATE DOCTOR
    */

    const doctor = await prisma.doctor.create({
      data: {
        firstName,
        lastName,
        speciality,
        address,
        phone,
        type,
        organizationId,
        sectorId,
      },
    })

    return NextResponse.json(doctor, { status: 201 })
  } catch (error) {
    console.error("CREATE DOCTOR ERROR:", error)

    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    )
  }
}