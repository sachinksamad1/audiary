import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@audiary/database';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: (config: ConfigService) => {
        const connectionString = config.get<string>('DATABASE_URL') || '';
        const client = postgres(connectionString, { prepare: false });
        return drizzle(client, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
