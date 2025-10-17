import { Body, Controller, Get, Param, Post, ParseIntPipe, Delete, Put, Req, UnauthorizedException } from '@nestjs/common';
import { ListService } from "./list.service";
import { ListDto } from "./dto/list.dto";
import type { AuthRequest } from 'src/types';

@Controller('list')
export class ListController{
  constructor(private listService: ListService){}

  @Get() 
  getLists()
  {
    return this.listService.getAllList();
  }

  @Get(':id') 
  getListById(@Param('id') id: string){  
    return this.listService.findListById(id);
  }

  @Post()
  createList(@Body() list: ListDto, @Req() request: AuthRequest){ //{ user?: { userId: string } }
    const user  =  request.user;
      
    if (user) {
      return this.listService.createList(list, user.userId);
    } else {
      throw new UnauthorizedException
    }
  }

  @Put(':id')
  updateList(@Body('listData') list: ListDto, @Param('id', ParseIntPipe) id: string){
    return this.listService.updateList(id, list);
  }

  @Delete(':id')
  public deleteList(@Param('id', ParseIntPipe) id: string){
    return this.listService.deleteList(id);
  }


}