import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') register(@Body() dto: RegisterDto): ReturnType<AuthService['register']> { return this.authService.register(dto); }
  @Post('login') @HttpCode(HttpStatus.OK) login(@Body() dto: LoginDto): ReturnType<AuthService['login']> { return this.authService.login(dto); }
  @Post('refresh') @HttpCode(HttpStatus.OK) refresh(@Body() dto: RefreshTokenDto): ReturnType<AuthService['refresh']> { return this.authService.refresh(dto.refreshToken); }
}
