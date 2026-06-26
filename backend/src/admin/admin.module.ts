import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLog } from '../common/entities/audit-log.entity';
import { UsersModule } from '../users/users.module';
import { TradesModule } from '../trades/trades.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    UsersModule,
    TradesModule,
    WalletModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
