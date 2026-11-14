import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const request = (supertest as unknown as { default?: typeof supertest }).default ?? supertest;

describe('Visit Flow API & Business Rules (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'sales@visitflow.id', password: 'password123' })
      .expect(201);

    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('menolak akses endpoint tanpa token login (proteksi URL)', async () => {
    await request(app.getHttpServer()).get('/api/activities').expect(401);
    await request(app.getHttpServer()).get('/api/entities').expect(401);
  });

  it('menerapkan filter kombinasi, rentang tanggal inklusif, dan konsistensi summary', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .query({
        segment: 'B2G',
        status: 'VISITED',
        from: '2026-03-10',
        to: '2026-03-10',
        search: 'melati',
      })
      .expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].entityName).toBe('Kantor Layanan Melati');
    expect(res.body.data[0].visitDate).toBe('2026-03-10');
    expect(res.body.summary).toEqual({
      total: 1,
      visited: 1,
      notVisited: 0,
    });
  });

  it('membedakan entitas bernama serupa menggunakan type dan mendukung fallback riwayat', async () => {
    const salesUser = await prisma.user.findUniqueOrThrow({
      where: { email: 'sales@visitflow.id' },
    });

    await prisma.entity.upsert({
      where: { id: 'ent-e2e-uptd' },
      update: {},
      create: {
        id: 'ent-e2e-uptd',
        name: 'Kantor Layanan Melati',
        type: 'UPTD',
        segment: 'B2G',
        region: 'Cimahi',
      },
    });

    await prisma.activity.upsert({
      where: { id: 'act-e2e-history' },
      update: {},
      create: {
        id: 'act-e2e-history',
        entityId: null,
        entityName: 'Mitra Strategis',
        entityType: 'Instansi',
        entityRegion: 'Bandung',
        segment: 'B2G',
        visitDate: new Date('2026-03-05T00:00:00.000Z'),
        status: 'VISITED',
        salesName: 'Raka Pratama',
        createdById: salesUser.id,
      },
    });

    try {
      const masterRes = await request(app.getHttpServer())
        .get('/api/entities')
        .set('Authorization', `Bearer ${token}`)
        .query({ segment: 'B2G', search: 'melati' })
        .expect(200);

      expect(masterRes.body.length).toBe(2);
      expect(masterRes.body.map((e: { type: string }) => e.type)).toEqual(['Instansi', 'UPTD']);

      const fallbackRes = await request(app.getHttpServer())
        .get('/api/entities')
        .set('Authorization', `Bearer ${token}`)
        .query({ segment: 'B2G', search: 'Mitra Strategis' })
        .expect(200);

      expect(fallbackRes.body.length).toBe(1);
      expect(fallbackRes.body[0].name).toBe('Mitra Strategis');
      expect(fallbackRes.body[0].source).toBe('HISTORY');
    } finally {
      await prisma.activity.deleteMany({ where: { id: 'act-e2e-history' } });
      await prisma.entity.deleteMany({ where: { id: 'ent-e2e-uptd' } });
    }
  });

  it('membuat rencana kunjungan dengan nama sales dan memperbarui status menjadi VISITED', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        entityId: 'ent-002',
        segment: 'B2B',
        visitDate: '2026-04-01',
        salesName: 'Budi Santoso',
      })
      .expect(201);

    try {
      expect(createRes.body.status).toBe('NOT_VISITED');
      expect(createRes.body.salesName).toBe('Budi Santoso');

      const patchRes = await request(app.getHttpServer())
        .patch(`/api/activities/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'VISITED' })
        .expect(200);

      expect(patchRes.body.status).toBe('VISITED');
    } finally {
      await prisma.activity.deleteMany({ where: { id: createRes.body.id } });
    }
  });
});
