import { Controller, Get, Put, Param, Body, Inject } from '@nestjs/common';
import { ProgressService } from './progress.service.js';
import { UpsertProgressDto } from './dto/upsert-progress.dto';

@Controller('progress')
export class ProgressController {
  constructor(
    @Inject(ProgressService) private readonly progressService: ProgressService,
  ) {}

  @Get(':bookId')
  findByBook(@Param('bookId') bookId: string) {
    return this.progressService.findByBook(bookId);
  }

  @Put(':bookId')
  upsert(@Param('bookId') bookId: string, @Body() dto: UpsertProgressDto) {
    return this.progressService.upsert(bookId, dto);
  }
}
