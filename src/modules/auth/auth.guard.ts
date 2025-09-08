import { AuthService } from './auth.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      let auth: string = request.headers['authorization'];
      let token;
      if (auth && auth.startsWith('Bearer')) {
        token = auth.split(' ')[1];
      }
      const decoded = await this.jwtService.verifyAsync(token,{
        secret:process.env.ACCESS_TOKEN_SECRET!
      });
      if (!decoded) {
        throw new UnauthorizedException('token expired!');
      }
      // console.log("id",decoded.id)
      const user = await this.authService.findOne(decoded.id);
      if (!user) {
        throw new UnauthorizedException("User doesn't exist!");
      }
      request.user = user;
      request.token = token;
      return true;
    } catch (error) {
      console.log("hello")
      throw new UnauthorizedException(error.message);
    }
  }
}
