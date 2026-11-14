import { PrismaClient, Role, Segment, VisitStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@visitflow.id' },
    update: {},
    create: {
      name: 'Raka Pratama',
      email: 'sales@visitflow.id',
      passwordHash,
      role: Role.SALES,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@visitflow.id' },
    update: {},
    create: {
      name: 'Dina Maharani',
      email: 'admin@visitflow.id',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.activity.deleteMany();
  await prisma.entity.deleteMany();

  const entitiesData = [
    {
      id: 'ent-001',
      name: 'Kantor Layanan Melati',
      type: 'Instansi',
      segment: Segment.B2G,
      region: 'Bandung',
    },
    {
      id: 'ent-002',
      name: 'Toko Sinar Jaya',
      type: 'Perusahaan',
      segment: Segment.B2B,
      region: 'Jakarta',
    },
  ];

  for (const entity of entitiesData) {
    await prisma.entity.upsert({
      where: { id: entity.id },
      update: entity,
      create: entity,
    });
  }

  await prisma.activity.createMany({
    data: [
      {
        id: 'act-001',
        entityId: 'ent-001',
        entityName: 'Kantor Layanan Melati',
        entityType: 'Instansi',
        entityRegion: 'Bandung',
        segment: Segment.B2G,
        visitDate: new Date('2026-03-10T00:00:00.000Z'),
        status: VisitStatus.VISITED,
        salesName: 'Raka Pratama',
        createdById: salesUser.id,
      },
      {
        id: 'act-002',
        entityId: 'ent-002',
        entityName: 'Toko Sinar Jaya',
        entityType: 'Perusahaan',
        entityRegion: 'Jakarta',
        segment: Segment.B2B,
        visitDate: new Date('2026-03-15T00:00:00.000Z'),
        status: VisitStatus.NOT_VISITED,
        salesName: 'Raka Pratama',
        createdById: salesUser.id,
      },
    ],
  });

  console.log('Seed data Visit Flow berhasil dijalankan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });