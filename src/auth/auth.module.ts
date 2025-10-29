import { Module, Global } from '@nestjs/common'; // Import Global
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// We no longer need forwardRef here
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';

@Global() // <-- MAKE THE MODULE GLOBAL
@Module({
  // We no longer need forwardRef for UserModule, but it doesn't hurt to keep it
  // if UserModule also needs things from AuthModule. Let's remove it for clarity.
  imports: [
    // forwardRef(() => UserModule), // No longer needed
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5h' },
      }),
    }),
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  // Export everything that should be globally available
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
