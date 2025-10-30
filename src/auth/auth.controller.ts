import { Body, Controller, HttpCode,  HttpStatus,  Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AllowPublic } from './decorators/allow-public.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @AllowPublic()
    @Post('login')
    @HttpCode(HttpStatus.OK)    
    login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }

    @AllowPublic()
    @Post('signUp')
    @HttpCode(HttpStatus.OK)    
    signUp(@Body() signUp: CreateUserDto){
        return this.authService.signup(signUp);
    }

    @AllowPublic()
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto){
        return this.authService.RefreshToken(refreshTokenDto);
    }
}
