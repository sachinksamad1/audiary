import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service.js';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Controller()
export class ChaptersController {
  constructor(
    @Inject(ChaptersService) private readonly chaptersService: ChaptersService,
  ) {}

  @Get('books/:bookId/chapters')
  findByBook(@Param('bookId') bookId: string) {
    return this.chaptersService.findByBook(bookId);
  }

  @Post('books/:bookId/chapters')
  create(@Param('bookId') bookId: string, @Body() dto: CreateChapterDto) {
    return this.chaptersService.create(bookId, dto);
  }

  @Get('chapters/:id')
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id);
  }

  @Put('chapters/:id')
  update(@Param('id') id: string, @Body() dto: UpdateChapterDto) {
    return this.chaptersService.update(id, dto);
  }

  @Delete('chapters/:id')
  remove(@Param('id') id: string) {
    return this.chaptersService.remove(id);
  }
}
