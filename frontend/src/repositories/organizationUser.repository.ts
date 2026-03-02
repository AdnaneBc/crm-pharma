import prisma from "@/lib/prisma";

export class OrganizationUserRepository {
  async findById(id: string) {
    return prisma.organizationUser.findUnique({
      where: { id },
    });
  }

  async findByUserAndOrg(userId: string, organizationId: string) {
    return prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }

  async findSubordinates(managerId: string) {
    return prisma.organizationUser.findMany({
      where: { managerId },
    });
  }
}
