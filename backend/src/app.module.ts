import { Module } from '@nestjs/common';
import { ActivitiesModule } from './activities/activities.module';
import { AuthModule } from './auth/auth.module';
import { EntitiesModule } from './entities/entities.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, ActivitiesModule, EntitiesModule],
})
export class AppModule {}
