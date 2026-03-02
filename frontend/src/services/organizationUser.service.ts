import { OrganizationUserRepository } from "@/src/repositories/organizationUser.repository";

export class OrganizationUserService {
  constructor(private repo = new OrganizationUserRepository()) {}

  async getUserMembership(userId: string, organizationId: string) {
    const membership = await this.repo.findByUserAndOrg(userId, organizationId);

    if (!membership) {
      throw new Error("User does not belong to this organization");
    }

    return membership;
  }

  async getSubordinates(currentUserId: string, organizationId: string) {
    const currentUser = await this.getUserMembership(
      currentUserId,
      organizationId,
    );

    // Only NSM & DSM can have subordinates
    if (!["NSM", "DSM"].includes(currentUser.businessRole || "")) {
      throw new Error("Unauthorized");
    }

    return this.repo.findSubordinates(currentUser.id);
  }
}
