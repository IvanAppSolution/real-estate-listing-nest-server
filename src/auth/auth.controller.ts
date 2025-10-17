import { Body, Controller,  Get,  HttpCode,  HttpStatus,  Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AllowPublic } from './decorators/allow-public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @AllowPublic()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() user: {email: string, password: string}){
        return this.authService.login(user.email, user.password);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req: ExpressRequest & { user?: any }) {
        return req?.user;
    }    
}
