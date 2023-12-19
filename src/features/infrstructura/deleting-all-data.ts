import { Controller, Delete, HttpCode, HttpStatus } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class DeleteAllTestingData {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteRegistrationTableData() {
    await this.dataSource.query(`DELETE FROM public."Registration"`);
  }
  async deleteAuthSessionTableData() {
    await this.dataSource.query(`DELETE FROM public."AuthSessionsMetaData"`);
  }
  async deleteUserTableData() {
    await this.dataSource.query(`DELETE FROM public."Users"`);
  }
}

@Controller("testing")
export class DeleteDataController {
  constructor(private readonly deleteRepository: DeleteAllTestingData) {}

  @Delete("/all-data")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTestData() {
    await this.deleteRepository.deleteRegistrationTableData();
    await this.deleteRepository.deleteAuthSessionTableData();
    await this.deleteRepository.deleteUserTableData();
  }
}
