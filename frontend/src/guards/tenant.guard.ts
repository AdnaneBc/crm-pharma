import { OrganizationUserService } from "@/src/services/organizationUser.service";

export class TenantGuard {
  private service = new OrganizationUserService();

  async validateAccess(userId: string, organizationId: string) {
    const membership = await this.service.getUserMembership(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new Error("Access denied to this organization");
    }

    return membership;
  }
}
