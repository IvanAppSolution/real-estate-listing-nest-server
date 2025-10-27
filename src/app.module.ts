import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ListModule } from './list/list.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AuthGuard } from './auth/auth.guard';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get('NODE_ENV');
        const isProduction = nodeEnv === 'production';
        
        // Database configuration
        const dbType = configService.get('DB_TYPE') || 'postgres';
        const dbHost = configService.get('DB_HOST');
        const dbPort = configService.get('DB_PORT');
        const dbUsername = configService.get('DB_USERNAME');
        const dbPassword = configService.get('DB_PASSWORD');
        const dbName = configService.get('DB_NAME');
        
        // SSL configuration - only in production or if explicitly enabled
        const sslEnabled = isProduction || configService.get('DB_SSL') === 'true';
        
        return {
          type: dbType as any,
          host: dbHost,
          port: parseInt(dbPort, 10),
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          autoLoadEntities: true,
          synchronize: !isProduction,
          logging: !isProduction,
          ssl: sslEnabled ? {
            rejectUnauthorized: false,
          } : false,
          extra: sslEnabled ? {
            ssl: {
              rejectUnauthorized: false,
            },
          } : {},
        };
      },
    }),
    AuthModule,
    UserModule,
    ListModule,
    CloudinaryModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}