import {
  PrismaClient,
  Role,
  OrganizationMode,
} from '../../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log('--- 🚀 Début du Seeding ---');

  // Nettoyage pour éviter les erreurs d'unicité au prochain lancement
  await prisma.organizationUser.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('Adnane2026!', saltRounds);

  // 1. Création de l'Organisation avec le SLUG obligatoire
  const masterOrg = await prisma.organization.create({
    data: {
      name: 'Adnane Tech Pharma',
      slug: 'adnane-tech-pharma', // 👈 La clé manquante était ici
      logoUrl: 'https://mon-logo.com/logo.png',
      mode: OrganizationMode.SAAS,
      isActive: true,
      expiresAt: new Date('2030-01-01'), // Optionnel mais propre
    },
  });

  // 2. Création de l'Utilisateur
  const user = await prisma.user.create({
    data: {
      email: 'adnane@pharma.ma',
      password: hashedPassword,
      name: 'Adnane SuperAdmin',
      isActive: true,
    },
  });

  // 3. Liaison avec le Rôle
  await prisma.organizationUser.create({
    data: {
      userId: user.id,
      organizationId: masterOrg.id,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log('--- ✅ Seed terminé sans erreur ---');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    pool.end();
  });
