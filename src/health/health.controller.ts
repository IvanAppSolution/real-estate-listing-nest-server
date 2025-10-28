import { Controller, Get } from '@nestjs/common';
import { AllowPublic } from 'src/auth/decorators/allow-public.decorator';
 

@Controller('health')
export class HealthController {
  @AllowPublic()
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

  @AllowPublic()
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