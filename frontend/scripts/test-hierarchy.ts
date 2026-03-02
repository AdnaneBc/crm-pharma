import "dotenv/config";
import prisma from "@/lib/prisma";

async function test() {
  const nsm = await prisma.organizationUser.findFirst({
    where: { businessRole: "NSM" },
    include: {
      subordinates: {
        include: {
          team: true,
        },
      },
    },
  });

  console.dir(nsm, { depth: null });

  const sectors = await prisma.sector.findMany({
    include: { manager: true },
  });

  console.log("Sectors:", sectors);

  const promo = await prisma.promotionalItem.findMany();
  console.log("Promo:", promo);
}

test().finally(() => prisma.$disconnect());
