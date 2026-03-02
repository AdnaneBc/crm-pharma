import { Pool } from "pg";
import {
  PrismaClient,
  PlatformRole,
  OrganizationRole,
  BusinessRole,
  PromoItemType,
  DoctorType,
} from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
  const password = await bcrypt.hash("password123", 10);

  // SUPER ADMIN
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@demo.com",
      name: "Super Admin",
      passwordHash: password,
      platformRole: PlatformRole.SUPER_ADMIN,
    },
  });

  // ORGANIZATION
  const org = await prisma.organization.create({
    data: { name: "Pharma Demo" },
  });

  // NSM
  const nsmUser = await prisma.user.create({
    data: { email: "nsm@demo.com", name: "NSM Demo", passwordHash: password },
  });

  const nsm = await prisma.organizationUser.create({
    data: {
      userId: nsmUser.id,
      organizationId: org.id,
      businessRole: BusinessRole.NSM,
    },
  });

  // DSM
  const dsmUser = await prisma.user.create({
    data: { email: "dsm@demo.com", name: "DSM Demo", passwordHash: password },
  });

  const dsm = await prisma.organizationUser.create({
    data: {
      userId: dsmUser.id,
      organizationId: org.id,
      businessRole: BusinessRole.DSM,
      managerId: nsm.id,
    },
  });

  // TEAM
  const team = await prisma.team.create({
    data: {
      name: "Team Casablanca",
      organizationId: org.id,
      managerId: dsm.id,
    },
  });

  // DELEGATE
  const delegateUser = await prisma.user.create({
    data: {
      email: "delegate@demo.com",
      name: "Delegate Demo",
      passwordHash: password,
    },
  });

  const delegate = await prisma.organizationUser.create({
    data: {
      userId: delegateUser.id,
      organizationId: org.id,
      businessRole: BusinessRole.DELEGATE,
      managerId: dsm.id,
      teamId: team.id,
    },
  });

  // ASSISTANTE
  const assistantUser = await prisma.user.create({
    data: {
      email: "assistant@demo.com",
      name: "Assistant Demo",
      passwordHash: password,
    },
  });

  const assistant = await prisma.organizationUser.create({
    data: {
      userId: assistantUser.id,
      organizationId: org.id,
      organizationRole: OrganizationRole.ADMIN,
      businessRole: BusinessRole.ASSISTANT,
    },
  });

  // SECTORS
  const sector = await prisma.sector.create({
    data: {
      name: "Casablanca Centre",
      organizationId: org.id,
      managerId: dsm.id,
    },
  });

  // DOCTORS
  await prisma.doctor.createMany({
    data: [
      {
        firstName: "Ahmed",
        lastName: "Bennani",
        type: DoctorType.PRIVATE,
        organizationId: org.id,
        sectorId: sector.id,
      },
      {
        firstName: "Salma",
        lastName: "El Idrissi",
        type: DoctorType.PUBLIC,
        organizationId: org.id,
        sectorId: sector.id,
      },
    ],
  });

  // PROMO ITEMS
  await prisma.promotionalItem.createMany({
    data: [
      {
        name: "Sample A",
        type: PromoItemType.SAMPLE,
        organizationId: org.id,
        totalStock: 100,
      },
      {
        name: "EMG Card",
        type: PromoItemType.EMG,
        organizationId: org.id,
        totalStock: 50,
      },
      {
        name: "Pen Gadget",
        type: PromoItemType.GADGET,
        organizationId: org.id,
        totalStock: 200,
      },
    ],
  });

  console.log("Seed terminé 🚀");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
