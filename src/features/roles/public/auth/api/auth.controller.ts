import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Post,
  Req,
  Res,
  // UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Request, Response } from "express";
import { BadRequestException } from "@nestjs/common";

import {
  AuthEmailResendingInputModal,
  AuthLoginInputModal,
  AuthRegistrationConfirmInputModal,
  AuthRegistrationInputModal,
  NewPasswordInputModal,
} from "./auth.models";
import { RegistrationUserCommand } from "../application/use-cases/registration-user-use-case";
import { RegistrationConfirmationCommand } from "../application/use-cases/registration-confirmation-use-case";
import {
  RegistrationConfirmationDTO,
  RegistrationConfirmationResultDTO,
} from "../application/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus // private readonly usersQueryRepository: UsersQueryRepository
  ) {}

  // @Post("login")
  // @HttpCode(200)
  // async login(
  //   @Req() request: Request,
  //   @Res() response: Response,
  //   @Ip() deviceIp,
  //   @Body() inputModel: AuthLoginInputModal
  // ) {
  //   // const tokens = await this.commandBus.execute(
  //   //   new LoginCommand({
  //   //     ...inputModel,
  //   //     deviceIp,
  //   //     deviceName: request.headers["user-agent"],
  //   //   })
  //   // );
  //   // response.cookie("refreshToken", tokens.refreshToken, {
  //   //   httpOnly: true,
  //   //   secure: true,
  //   //   // expires: addSeconds(new Date(), 20),
  //   // });
  //   // return response.status(200).send({ accessToken: tokens.accessToken });
  // }

  // @Post("refresh-token")
  // // @UseGuards(RefreshTokenGuard)
  // @HttpCode(200)
  // async refreshtoken(
  //   @Req() request: Request,
  //   @Res() response: Response
  // ): Promise<undefined> {
  //   // const tokens = await this.commandBus.execute(
  //   //   new UpdateUserRefreshTokenCommand({
  //   //     userId: request.body.userId,
  //   //     deviceId: request.body.deviceId,
  //   //   })
  //   // );
  //   // response.cookie("refreshToken", `${tokens.refreshToken}`, {
  //   //   httpOnly: true,
  //   //   secure: true,
  //   //   // expires: addSeconds(new Date(), 20),
  //   // });
  //   // response.status(200).send({ accessToken: tokens.accessToken });
  //   // return;
  // }

  // @Post("logout")
  // // @UseGuards(RefreshTokenGuard)
  // @HttpCode(204)
  // async logOut(@Req() request: Request, @Res() response: Response) {
  //   // await this.commandBus.execute(
  //   //   new DeleteCurrentDeviceCommand({
  //   //     deviceId: request.body.deviceId,
  //   //     userId: request.body.userId,
  //   //   })
  //   // );
  //   // return response
  //   //   .cookie("refreshToken", ``, {
  //   //     httpOnly: true,
  //   //     secure: true,
  //   //     // expires: new Date(),
  //   //   })
  //   //   .send();
  // }

  @Post("registration")
  // @UseGuards(BlockIpGuard)
  @HttpCode(204)
  async registration(
    @Body() inputModel: AuthRegistrationInputModal
  ): Promise<void> {
    const { login, email, password } = inputModel;

    const { isLoginAlreadyExist, isEmailAlreadyExist, isUserRegistered } =
      await this.commandBus.execute(
        new RegistrationUserCommand({
          login: login,
          email: email,
          password: password,
        })
      );

    if (isLoginAlreadyExist) {
      throw new BadRequestException({
        message: "Login is already exist",
        field: "login",
      });
    }

    if (isEmailAlreadyExist) {
      throw new BadRequestException({
        message: "Email is already exist",
        field: "email",
      });
    }

    return isUserRegistered;
  }

  @Post("registration-confirmation")
  // @UseGuards(BlockIpGuard)
  @HttpCode(204)
  async registrationConfirmation(
    @Body() inputModel: AuthRegistrationConfirmInputModal
  ): Promise<boolean> {
    const {
      isUserByConfirmCodeFound,
      isEmailAlreadyConfirmed,
      isConfirmDateExpired,
      isRegistrationConfirmed,
    } = await this.commandBus.execute<
      unknown,
      RegistrationConfirmationResultDTO
    >(new RegistrationConfirmationCommand({ code: inputModel.code }));

    if (!isUserByConfirmCodeFound) {
      throw new NotFoundException("User by this confirm code not found");
    }

    if (isEmailAlreadyConfirmed) {
      throw new BadRequestException({
        message: "Email is already confirmed",
        field: "code",
      });
    }

    if (isConfirmDateExpired) {
      throw new BadRequestException("Date is already expired");
    }
    return isRegistrationConfirmed;
  }

  // @Post("registration-email-resending")
  // // @UseGuards(BlockIpGuard)
  // @HttpCode(204)
  // async registrationEmailResending(
  //   @Body() inputModel: AuthEmailResendingInputModal
  // ): Promise<void> {
  //   // return this.commandBus.execute(new EmailResendingCommand(inputModel.email));
  // }

  // @Get("me")
  // // @UseGuards(AuthGuard)
  // async getMe(@Req() request: Request): Promise<boolean> {
  //   return true;
  //   // return await this.usersQueryRepository.findMe(request.body.userId);
  // }

  // @Post("password-recovery")
  // // @UseGuards(BlockIpGuard)
  // @HttpCode(204)
  // async passwordRecovery(
  //   @Body() inputModel: AuthEmailResendingInputModal
  // ): Promise<void> {
  //   // return this.commandBus.execute(
  //   //   new PasswordRecoveryCommand(inputModel.email)
  //   // );
  // }

  // @Post("new-password")
  // // @UseGuards(BlockIpGuard)
  // @HttpCode(204)
  // async newPassword(
  //   @Body() inputModal: NewPasswordInputModal
  // ): Promise<boolean> {
  //   return true;
  //   // return this.commandBus.execute(new NewPasswordCommand(inputModal));
  // }
}
