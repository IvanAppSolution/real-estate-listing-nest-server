import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
 
@Injectable()
export class AuthService {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        private jwtService: JwtService
    ){}

    isAuthenticated: boolean = false;

    public async login(email: string, password: string) {
       
        const user = await this.userService.findUserByEmal( email);

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                const payload = { userId: user.id, email: user.email};
                return {
                    token: await this.jwtService.signAsync(payload),
                    user: user
                };
            } else {
                throw new UnauthorizedException();
            }
            
        } else {
            throw new UnauthorizedException();
        }
    } 
    
}
