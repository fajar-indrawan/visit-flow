import { Injectable } from '@nestjs/common';
import { Prisma, Segment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface EntityOption {
  id: string;
  name: string;
  type: string;
  segment: Segment;
  region: string;
  displayName: string;
  source: 'MASTER' | 'HISTORY';
}

@Injectable()
export class EntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOptions(segment?: Segment, search?: string): Promise<EntityOption[]> {
    const trimmedSearch = search?.trim();

    const masterWhere: Prisma.EntityWhereInput = {};
    if (segment) {
      masterWhere.segment = segment;
    }
    if (trimmedSearch) {
      masterWhere.name = { contains: trimmedSearch };
    }

    const masterEntities = await this.prisma.entity.findMany({
      where: masterWhere,
      orderBy: [{ name: 'asc' }, { type: 'asc' }],
    });

    if (masterEntities.length > 0) {
      return this.deduplicateEntities(
        masterEntities.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          segment: item.segment,
          region: item.region,
          displayName: `${item.name} (${item.type})`,
          source: 'MASTER',
        })),
      );
    }

    const historyWhere: Prisma.ActivityWhereInput = {};
    if (segment) {
      historyWhere.segment = segment;
    }
    if (trimmedSearch) {
      historyWhere.entityName = { contains: trimmedSearch };
    }

    const historyActivities = await this.prisma.activity.findMany({
      where: historyWhere,
      orderBy: { visitDate: 'desc' },
    });

    const mappedHistory: EntityOption[] = historyActivities.map((act) => ({
      id: act.entityId || `hist:${act.id}`,
      name: act.entityName,
      type: act.entityType,
      segment: act.segment,
      region: act.entityRegion,
      displayName: `${act.entityName} (${act.entityType})`,
      source: 'HISTORY',
    }));

    return this.deduplicateEntities(mappedHistory);
  }

  deduplicateEntities(items: EntityOption[]): EntityOption[] {
    const seen = new Set<string>();
    const unique: EntityOption[] = [];

    for (const item of items) {
      const key = `${item.name.trim().toLowerCase()}::${item.type.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique;
  }
}
