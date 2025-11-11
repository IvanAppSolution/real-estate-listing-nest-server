import { Injectable, Inject, UnauthorizedException, forwardRef } from '@nestjs/common';
import { UserService } from '../user/user.service';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ConfigType } from '@nestjs/config';
import authConfig from './config/auth.config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ActiveUserType } from './interfaces/active-user-type.interface';
import { User } from '../user/user.entity';
import { UserDto } from 'src/user/dto/user.dto';
 
@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        @Inject(authConfig.KEY)
        private readonly authConfiguration: ConfigType<typeof authConfig>,
        private jwtService: JwtService,
    ){}

    isAuthenticated: boolean = false;

    public async login(loginDto: LoginDto) {
       
        const user = await this.userService.findUserByEmail( loginDto.email);

        if (user) {
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

            if (isPasswordValid) {
                const {token, refreshToken} = await this.generateToken(user);
                
                // Destructure to remove unnecessary field
                const { password: _, createdAt: _1, updatedAt: _2, deleteAt: _3, ...result } = user;
                return {
                    token: token,
                    refreshToken: refreshToken,
                    user: result,
                    success: true
                };
            } else {
                throw new UnauthorizedException();
            }
            
        } else {
            throw new UnauthorizedException();
        }
    } 

     public async signup(createUserDto: UserDto) {
        return {
            success: true,
            user: await this.userService.createUser(createUserDto)
        } 
    }

    public async RefreshToken(refreshTokenDto: RefreshTokenDto) {
        try {
            //1. VERIFY THE REFRESH TOKEN
            const { id } = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
                secret: this.authConfiguration.secret
                // audience: this.authConfiguration.audience,
                // issuer: this.authConfiguration.issuer
            })

            //2. FIND THE USER FROM DB USING USER ID
            const user = await this.userService.findUserById(id);

            //3. GENERATE AN ACCESS TOKEN & REFRESH TOKEN
            return await this.generateToken(user);
        } catch (error) {
            throw new UnauthorizedException(error);
        }

    }

    private async signToken(payload: Record<string, any>, expiresIn: (number | string)) {
        // return await this.jwtService.signAsync({
        //     id: userId,
        //     ...payload
        // }, {
        //     secret: this.authConfiguration.secret,
        //     expiresIn: expiresIn as any  // Cast to bypass the type issue
        //     // audience: this.authConfiguration.audience,
        //     // issuer: this.authConfiguration.issuer
        // });

        const p = { id: payload.id, email: payload.email };
        return await this.jwtService.signAsync(p, {
            expiresIn: expiresIn as any, // Token expiration time (e.g., 1 hour)
            secret: this.authConfiguration.secret, // Use a strong secret from environment variables
        });

    }

    private async generateToken(user: User) {
        //GENERATE AN ACCESS TOKEN
        const accessToken = await this.signToken({id: user.id, email: user.email }, '1h');

        //GENERATE A REFRESH TOKEN
        const refreshToken = await this.signToken({id: user.id, email: user.email }, '4h');

        return { token: accessToken, refreshToken };
    }
    
}
