
import {
  CanActivate,
  ExecutionContext,
  Get,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface JwtPayload {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService, 
    private readonly configService: ConfigService,
    private reflector: Reflector) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    try {
      // Verify and decode the JWT token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET')
      });
      
      // Attach the user payload to the request object
      // This makes the user data available in your controllers
      request['user'] = payload;
      
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Token is invalid or expired
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return undefined;
    }
    
    // Check if header starts with "Bearer "
    const [type, token] = authHeader.split(' ');
    
    return type === 'Bearer' ? token : undefined;
  }
}
