/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';

@Controller('idea')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  @Get()
  showAll() {
    return this.ideaService.showAll();
  }

  @Post()
  create(@Body() data: IdeaDTO) {
    return this.ideaService.create(data);
  }

  @Get(':id')
  read(@Param('id') id: string) {
    return this.ideaService.read(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<IdeaDTO>) {
    return this.ideaService.update(id, data);
  }

  @Delete(':id')
  destroy(@Param('id') id: string) {
    return this.ideaService.destroy(id);
  }
}
