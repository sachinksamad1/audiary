import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module.js';
import { BooksModule } from './books/books.module.js';
import { ChaptersModule } from './chapters/chapters.module.js';
import { ProgressModule } from './progress/progress.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? []
          : [
              '../../.env',
              '../../.env.development',
              '.env',
              '.env.development',
            ],
    }),
    DatabaseModule,
    BooksModule,
    ChaptersModule,
    ProgressModule,
  ],
})
export class AppModule {}
