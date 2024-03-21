import { Body, Controller, Get, Param, Patch, ValidationPipe } from "@nestjs/common";
import { PointHistory, TransactionType, UserPoint } from "./point.model";
import { UserPointTable } from "../database/userpoint.table";
import { PointHistoryTable } from "../database/pointhistory.table";
import { PointBody as PointDto } from "./point.dto";


@Controller('/point')
export class PointController {

    constructor(
        private readonly userDb: UserPointTable,
        private readonly historyDb: PointHistoryTable,
    ) {}

    /**
     * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
     */
    @Get(':id')
    async point(@Param('id') id): Promise<UserPoint> {
        const userId = Number.parseInt(id)

        const userCurrentPoint = await this.userDb.selectById(userId)
        return { id: userId, point: userCurrentPoint.point, updateMillis: Date.now() }
    }

    /**
     * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
     */
    @Get(':id/histories')
    async history(@Param('id') id): Promise<PointHistory[]> {
        const userId = Number.parseInt(id)
        const userPointHistory = await this.historyDb.selectAllByUserId(userId)
        
        return userPointHistory
    }

    /**
     * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
     */
    @Patch(':id/charge')
    async charge(
        @Param('id') id,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        const userId = Number.parseInt(id)
        const amount = pointDto.amount

        // 1. 충전한다.
        const chargeResult = await this.historyDb.insert(userId, amount, TransactionType.CHARGE, Date.now()  )

        // 2. 히스토리 내역으로 현재 포인트를 추정한다.
        const userPointHistory = await this.historyDb.selectAllByUserId(userId)
        let pointSum = 0;
        userPointHistory.map((history) => {
            pointSum += history.amount
        });
        // 3. 현재 포인트를 업데이틀한다.
        await this.userDb.insertOrUpdate(userId, pointSum)

        return { id: userId, point: amount, updateMillis: Date.now() }
    }

    /**
     * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
     */
    @Patch(':id/use')
    async use(
        @Param('id') id,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        const userId = Number.parseInt(id)
        const amount = pointDto.amount

        // 예외1 : 가진 포인트보다 많은 포인트를 소진하려면 에러 
        const userCurrentPoint = await this.userDb.selectById(userId)
        if(userCurrentPoint.point < amount) {
            throw new Error('USE_POINT_EXCEEDS_CURRENT_POINT')
        }

        // 1. 충전한다.
        const chargeResult = await this.historyDb.insert(userId, -1*amount, TransactionType.CHARGE, Date.now()  )

        // 2. 히스토리 내역으로 현재 포인트를 추정한다.
        const userPointHistory = await this.historyDb.selectAllByUserId(userId)
        let pointSum = 0;
        userPointHistory.map((history) => {
            pointSum += history.amount
        });
        // 3. 현재 포인트를 업데이를한다.
        await this.userDb.insertOrUpdate(userId, pointSum)

        return { id: userId, point: amount, updateMillis: Date.now() }
    }
}