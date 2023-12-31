import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { UpdateUserRefreshTokenUseCase } from "./refresh-token-use-case";
import { AuthService } from "../auth.service";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { AuthMetaDataViewModel } from "../../../../../infrstructura/deviceSessions/models/device.models";

const getRefreshTokenDTOMock = {
  userId: "123",
  deviceId: "456",
};

describe("Refresh token use case", () => {
  let app: TestingModule;
  let refreshTokenUseCase: UpdateUserRefreshTokenUseCase;
  let authService: AuthService;
  let usersRepository: UsersRepository;
  let deviceSessionRepository: DeviceSessionsRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    refreshTokenUseCase = app.get<UpdateUserRefreshTokenUseCase>(
      UpdateUserRefreshTokenUseCase
    );
    authService = app.get<AuthService>(AuthService);
    deviceSessionRepository = app.get<DeviceSessionsRepository>(
      DeviceSessionsRepository
    );
    usersRepository = app.get<UsersRepository>(UsersRepository);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(refreshTokenUseCase).toBeDefined();
    expect(authService).toBeDefined();
    expect(deviceSessionRepository).toBeDefined();
    expect(usersRepository).toBeDefined();
  });
  it("Should not return tokens, if userData not found", async () => {
    jest
      .spyOn(usersRepository, "findUserById")
      .mockImplementation(async () => null);

    const result = await refreshTokenUseCase.execute({
      getRefreshTokenDTO: getRefreshTokenDTOMock,
    });

    expect(result).toEqual({
      isUserFound: false,
      isUserAlreadyHasAuthSession: false,
      accessToken: null,
      refreshToken: null,
    });
  });
  it("Should not return tokens, if authMetaData not found", async () => {
    jest
      .spyOn(usersRepository, "findUserById")
      .mockImplementation(async () => ({
        id: "id123",
        login: "login",
        password: "123",
        email: "email",
      }));

    jest
      .spyOn(deviceSessionRepository, "getAuthMetaDataByDeviceIdAndUserId")
      .mockImplementation(async () => null);

    const result = await refreshTokenUseCase.execute({
      getRefreshTokenDTO: getRefreshTokenDTOMock,
    });

    expect(result).toEqual({
      isUserFound: true,
      isUserAlreadyHasAuthSession: false,
      accessToken: null,
      refreshToken: null,
    });
  });
  it("Should update auth meta data, if already have, and return tokens", async () => {
    jest
      .spyOn(usersRepository, "findUserById")
      .mockImplementation(async () => ({
        id: "id123",
        login: "login",
        password: "123",
        email: "email",
      }));

    jest
      .spyOn(deviceSessionRepository, "getAuthMetaDataByDeviceIdAndUserId")
      .mockImplementation(async () => ({}) as AuthMetaDataViewModel);

    // mock CT
    jest
      .spyOn(authService, "createAccessToken")
      .mockImplementation(async () => "access token");

    // mock RT
    jest
      .spyOn(authService, "createRefreshToken")
      .mockImplementation(async () => "refresh token");
    const result = await refreshTokenUseCase.execute({
      getRefreshTokenDTO: getRefreshTokenDTOMock,
    });

    expect(result).toEqual({
      isUserFound: true,
      isUserAlreadyHasAuthSession: true,
      accessToken: "access token",
      refreshToken: "refresh token",
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
