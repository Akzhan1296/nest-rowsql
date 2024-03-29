import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
// import { UsersQueryRepository } from '../features/users/infrastructure/repository/users.query.repository';
import { JwtService } from "@nestjs/jwt";
// import { JwtPayloadDTO } from '../features/jwt/application/dto/jwt.dto';
import { settings } from "../settings";
import { UsersRepository } from "../features/infrstructura/users/users.repository";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }

    const token = request.headers.authorization.split(" ")[1];
    let payload = null;
    let user = null;

    try {
      payload = this.jwtService.verify(token, {
        secret: settings.JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException();
    }
    if (payload && payload.userId && payload.userId.length > 0) {
      user = await this.usersRepository.findUserById(payload.userId);
    }
    if (user) {
      request.body.userId = payload.userId;
      request.body.userLogin = payload.login;

      return true;
    }
    throw new UnauthorizedException();
  }
}
