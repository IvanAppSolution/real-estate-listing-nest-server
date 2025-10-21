import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;  
    iat: number;
    exp: number;
  }
  body: any
}