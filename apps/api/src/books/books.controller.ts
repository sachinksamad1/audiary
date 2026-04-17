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
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(
    @Inject(BooksService) private readonly booksService: BooksService,
  ) {}

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOneWithChapters(id);
  }

  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
