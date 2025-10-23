import { Body, Controller, Get, Param, Post, ParseIntPipe, Delete, Put } from '@nestjs/common';
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";
import { AllowPublic } from '../auth/decorators/allow-public.decorator';
@Controller('user')
export class UserController{
    constructor(private userService: UserService){}

   @AllowPublic() 
   @Get() 
   getUsers()
   {
     console.log('getUsers()')
     return this.userService.getAllUsers();
   }

   @AllowPublic()
   @Post('/register')
   createUser(@Body() user: UserDto){
    return this.userService.createUser(user);
   }

   @Put(':id')
   updateUser(@Body() user: UserDto, @Param('id', ParseIntPipe) id: string){
    return this.userService.updateUser(id, user);
   }

   @Delete(':id')
   public deleteUser(@Param('id', ParseIntPipe) id: string){
    return this.userService.deleteUser(id);
   }

}