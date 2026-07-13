import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(
    @CurrentUser() user: JwtUser,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string;
    },
  ) {
    return this.usersService.updateProfile(user.sub, body);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change my password' })
  changePassword(
    @CurrentUser() user: JwtUser,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    return this.usersService.changePassword(
      user.sub,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'Get my addresses' })
  getAddresses(@CurrentUser() user: JwtUser) {
    return this.usersService.getAddresses(user.sub);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Add a new address' })
  createAddress(
    @CurrentUser() user: JwtUser,
    @Body()
    body: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      ward?: string;
      district: string;
      province: string;
      country?: string;
      postalCode?: string;
      isDefault?: boolean;
    },
  ) {
    return this.usersService.createAddress(user.sub, body);
  }

  @Patch('me/addresses/:id')
  @ApiOperation({ summary: 'Update an address' })
  updateAddress(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body()
    body: Partial<{ fullName: string; phone: string; isDefault: boolean }>,
  ) {
    return this.usersService.updateAddress(user.sub, id, body);
  }

  @Delete('me/addresses/:id')
  @ApiOperation({ summary: 'Delete an address' })
  deleteAddress(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.usersService.deleteAddress(user.sub, id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: '[Admin] List all users' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(+page, +limit, search);
  }
}
