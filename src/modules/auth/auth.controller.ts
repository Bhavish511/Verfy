import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgetPasswordDto } from './dto/forgetpassword.dto';
import { AuthGuard } from './auth.guard';
import { CompleteLoginDto } from './dto/CompleteLogin.dto';
import { VerifyCredentialsDto } from './dto/submember-credentials.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signUp(@Body() loginDto: LoginDto) {
    return this.authService.signUp(loginDto);
  }

  @Post('login-member')
  Login(@Body() loginDto: LoginDto) {
    return this.authService.LoginforMember(loginDto);
  }
  //API 1: Verify sub-member credentials
  @Post('login-sub-member')
  verifySubMemberCredentials(
    @Body() verifyCredentialsDto: VerifyCredentialsDto,
  ) {
    const { email, password } = verifyCredentialsDto;
    return this.authService.verifySubMemberCredentials(email, password);
  }

  // API 2: Complete login with invitation code
  @Post('submember/invitationCode')
  completeSubMemberLogin(@Body() completeLoginDto: CompleteLoginDto) {
    const { userId, invitationCode } = completeLoginDto;
    return this.authService.completeSubMemberLogin(userId, invitationCode);
  }

  @Post('forget-password')
  findOneWithEmail(@Body() body: ForgetPasswordDto) {
    return this.authService.findOneWithEmail(body.email);
  }

  @Post('reset-password')
  update(@Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.resetPassword(updateAuthDto);
  }
  @Get('logout')
  async logout(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Patch('update-profile')
  @UseGuards(AuthGuard)
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Patch('update-profile-picture')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateProfilePicture(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.authService.updateProfilePicture(
      req.user.id,
      file,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
