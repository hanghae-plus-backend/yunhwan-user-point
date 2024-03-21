import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from './point.controller';
import { PointHistoryTable } from '../database/pointhistory.table';
import { UserPointTable } from '../database/userpoint.table';
import { BadRequestException } from '@nestjs/common';
// import { AppService } from './app.service';
// import { PointController } from './point.controller';

describe('AppController', () => {
  let appController: PointController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PointController],
      providers: [UserPointTable, PointHistoryTable],
    }).compile();

    appController = app.get<PointController>(PointController);
  });

  describe('root', () => {

    it('should return "id"', async () => {
      expect( (await appController.point(1))['id']).toBe(1);
    });

    it('chart amount can not smaller than 0', async () => {
      const amount = 100
      const result = await appController.charge(152, {amount: amount});

      expect(result['point']).toBe(amount);
    });


    it('length cannot smaller than 0', async () => {
      const result = await appController.history(1);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });




  // it('/ (PATCH) point charge is response BAD_REQUEST cause invalid amount', async () => {
  //   const userId = 1
  //   const amount = -100

  //   const result = await request(app.getHttpServer())
  //       .patch(`/point/${userId}/charge`)
  //       .send({ amount })

  //   console.log('요청!...' )

  //   expect(result.status).toBe(HttpStatus.BAD_REQUEST)
  // })


});
