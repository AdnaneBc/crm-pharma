import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from 'src/dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async login(body: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: body.email },
      include: {
        memberships: true, // 🔑 On récupère le lien avec l'organisation
      },
    });

    if (!user) throw new UnauthorizedException('User Not found');

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid Password');

    // Pour le MVP, on prend la première organisation trouvée
    const mainMembership = user.memberships[0];
    if (!mainMembership)
      throw new UnauthorizedException('No organization linked');

    // On passe l'orgId et le role à la génération du token
    return this.generateJWT(
      user.id,
      user.name,
      mainMembership.organizationId,
      mainMembership.role,
    );
  }

  private generateJWT(id: string, name: string, orgId: string, role: string) {
    return jwt.sign(
      {
        sub: id,
        name,
        orgId, // 🔑 Sera utilisé par l'Interceptor pour filtrer les données
        role, // 🔑 Sera utilisé par le RolesGuard pour les permissions
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' },
    );
  }
}
