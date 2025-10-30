import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD, Reflector } from '@nestjs/core'; // <-- 1. Import Reflector
// import { AuthGuard } from './auth/auth.guard';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { HealthController } from './health/health.controller';
import { User } from './user/user.entity';
import { List } from './list/list.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ListModule } from './list/list.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import envValidator from './config/env.validation';
import authConfig from './auth/config/auth.config';
import { AuthorizeGuard } from './auth/guards/authorize.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, authConfig],
      validationSchema: envValidator
    }),
    JwtModule.registerAsync(authConfig.asProvider()),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        
        const dbConfig = {
          type: 'postgres' as const,
          autoLoadEntities: configService.get('database.autoLoadEntities'),
          synchronize: configService.get('database.syncronize'),
          host: configService.get('database.host'),
          port: +configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          entities: [User, List],
          ssl: isProduction 
            ? { rejectUnauthorized: false } 
            : false,
        };

        console.log('--- DATABASE CONNECTION CONFIG ---');
        console.log('Host:', dbConfig.host);
        console.log('Is Production:', isProduction);
        console.log('SSL Enabled:', !!dbConfig.ssl);
        console.log('---------------------------------');

        return dbConfig;
      },
    }),
    AuthModule,
    UserModule,
    ListModule,
    CloudinaryModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthorizeGuard
    },
  ],
})
export class AppModule {}