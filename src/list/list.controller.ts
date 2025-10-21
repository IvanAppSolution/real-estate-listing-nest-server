import { Body, Controller, Get, Param, Post, ParseIntPipe, Delete, Put, Req, UnauthorizedException, UseInterceptors, UploadedFiles, ParseUUIDPipe } from '@nestjs/common';
import { ListService } from "./list.service";
import { CreateListDto, UpdateListDto } from "./dto/list.dto";
import type { AuthRequest } from 'src/types';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('list')
export class ListController{
  constructor(private listService: ListService, private readonly cloudinaryService: CloudinaryService){}

  @Get() 
  getLists(@Req() request: AuthRequest){
    const user = request.user;
    if (user?.role === 'admin') {
      return this.listService.getAllList();
    } else {
      throw new UnauthorizedException
    }
    
  }
  
  @Get('myListings') 
  getMyLists(@Req() request: AuthRequest){
    const user = request.user;

    if (user) {
      return this.listService.findListByUserId(user.id);
    }    
  }

  @Get(':id') 
  getListById(@Param('id') id: string){  
    return this.listService.findListById(id);
  }


  @Post()
  createList( @Body('listData') listDataString: string, @Req() request: AuthRequest){
    const user = request.user;

    // Parse JSON string to object
      const listData = typeof listDataString === 'string' 
        ? JSON.parse(listDataString) 
        : listDataString;
      
    if (user) {
      return this.listService.createList(listData as CreateListDto);
    } else {
      throw new UnauthorizedException
    }
  }

  @Put(':id')
  async updateList(
    @Body('listData') listDataString: string, 
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthRequest
  ) {
    try {
      const user = request.user;

      // Parse JSON string to object
      const listData = typeof listDataString === 'string' 
        ? JSON.parse(listDataString) 
        : listDataString;
      
      // Remove fields that shouldn't be updated
      const { user: _user, userId: _userId, ...updateData } = listData;
      
      if (user) {    
        return this.listService.updateList(id, updateData as UpdateListDto);
      }
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  }

  @Delete(':id')
  deleteList(@Param('id', ParseIntPipe) id: string){
    return this.listService.deleteList(id);
  }

  @Post('media/upload')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      const results = await this.cloudinaryService.uploadMultipleFiles(files);

      return {
        success: true,
        data: results.map(result => (
           result.secure_url
       ))
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {  success: false,  message: 'Files upload failed', error: errorMessage
      };
    }
  }


}