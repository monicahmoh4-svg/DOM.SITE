import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../common/entities/audit-log.entity';
import { UsersService } from '../users/users.service';
import { TradesService } from '../trades/trades.service';
import { WalletService } from '../wallet/wallet.service';
import { KYCStatus } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly usersService: UsersService,
    private readonly tradesService: TradesService,
    private readonly walletService: WalletService,
  ) {}

  async getDashboardStats() {
    const userStats = await this.usersService.getStats();
    return {
      users: userStats,
      timestamp: new Date().toISOString(),
    };
  }

  async getUsers(params: { page: number; limit: number; search?: string }) {
    return this.usersService.findAll(params);
  }

  async suspendUser(adminId: string, userId: string, reason: string) {
    await this.usersService.suspendUser(userId);
    await this.auditRepo.save({
      userId: adminId,
      action: 'admin_action' as any,
      metadata: { action: 'suspend_user', targetUserId: userId, reason },
    });
    this.logger.warn(`Admin ${adminId} suspended user ${userId}: ${reason}`);
  }

  async activateUser(adminId: string, userId: string) {
    await this.usersService.activateUser(userId);
    await this.auditRepo.save({
      userId: adminId,
      action: 'admin_action' as any,
      metadata: { action: 'activate_user', targetUserId: userId },
    });
  }

  async approveKYC(adminId: string, userId: string) {
    await this.usersService.updateKYCStatus(userId, KYCStatus.APPROVED);
    await this.auditRepo.save({
      userId: adminId,
      action: 'admin_action' as any,
      metadata: { action: 'approve_kyc', targetUserId: userId },
    });
  }

  async rejectKYC(adminId: string, userId: string, reason: string) {
    await this.usersService.updateKYCStatus(userId, KYCStatus.REJECTED);
    await this.auditRepo.save({
      userId: adminId,
      action: 'admin_action' as any,
      metadata: { action: 'reject_kyc', targetUserId: userId, reason },
    });
  }

  async getAuditLogs(params: { page: number; limit: number; userId?: string }) {
    const { page = 1, limit = 50, userId } = params;
    const qb = this.auditRepo.createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (userId) qb.where('log.userId = :userId', { userId });

    const [logs, total] = await qb.getManyAndCount();
    return { logs, total, page, limit };
  }
}
