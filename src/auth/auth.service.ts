import { Injectable, Inject, UnauthorizedException, forwardRef } from '@nestjs/common';
import { UserService } from '../user/user.service';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
 
@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        private jwtService: JwtService
    ){}

    isAuthenticated: boolean = false;

    public async login(email: string, password: string) {
       
        const user = await this.userService.findUserByEmal( email);

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                const payload = { id: user.id, email: user.email, username: user.username, role: user.role};
                // Destructure to remove unnecessary field
                const { password: _, createdAt: _1, updatedAt: _2, deleteAt: _3, ...result } = user;
                return {
                    token: await this.jwtService.signAsync(payload),
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
    
}
