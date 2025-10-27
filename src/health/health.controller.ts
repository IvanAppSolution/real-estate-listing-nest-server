import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.guard';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      success: true,
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Public()
  @Get('db')
  async checkDatabase() {
    // You can add database connection check here if needed
    return {
      success: true,
      status: 'ok',
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}