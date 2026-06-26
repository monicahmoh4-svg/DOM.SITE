import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers({ page, limit, search });
  }

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a user' })
  async suspendUser(
    @CurrentUser() admin: User,
    @Param('id') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.suspendUser(admin.id, userId, reason);
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Activate a user' })
  async activateUser(@CurrentUser() admin: User, @Param('id') userId: string) {
    return this.adminService.activateUser(admin.id, userId);
  }

  @Patch('users/:id/kyc/approve')
  @ApiOperation({ summary: 'Approve KYC for a user' })
  async approveKYC(@CurrentUser() admin: User, @Param('id') userId: string) {
    return this.adminService.approveKYC(admin.id, userId);
  }

  @Patch('users/:id/kyc/reject')
  @ApiOperation({ summary: 'Reject KYC for a user' })
  async rejectKYC(
    @CurrentUser() admin: User,
    @Param('id') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectKYC(admin.id, userId, reason);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getAuditLogs({ page, limit, userId });
  }
}
