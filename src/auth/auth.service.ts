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

    private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
        return await this.jwtService.signAsync({
            id: userId,
            ...payload
        }, {
            secret: this.authConfiguration.secret,
            expiresIn: expiresIn
            // audience: this.authConfiguration.audience,
            // issuer: this.authConfiguration.issuer
        });
    }

    private async generateToken(user: User) {
        //GENERATE AN ACCESS TOKEN
        const accessToken = await this.signToken<Partial<ActiveUserType>>(user.id, this.authConfiguration.expiresIn, { email: user.email })

        //GENERATE A REFRESH TOKEN
        const refreshToken = await this.signToken(user.id, this.authConfiguration.refreshTokenExpiresIn);

        return { token: accessToken, refreshToken };
    }
    
}
