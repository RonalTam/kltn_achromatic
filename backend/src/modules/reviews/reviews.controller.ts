import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { HelpfulVotesQueryDto } from './dto/helpful-votes-query.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { UploadReviewImageDto } from './dto/upload-review-image.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a verified-purchase product review' })
  create(@CurrentUser() user: JwtUser, @Body() body: CreateReviewDto) {
    return this.reviewsService.create(user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('images')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload one image for a product review' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'productId'],
      properties: {
        file: { type: 'string', format: 'binary' },
        productId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, callback) => {
        const allowedMimeTypes = new Set([
          'image/jpeg',
          'image/png',
          'image/webp',
        ]);
        if (allowedMimeTypes.has(file.mimetype)) callback(null, true);
        else
          callback(
            new BadRequestException(
              'Only JPEG, PNG, and WebP images are allowed',
            ),
            false,
          );
      },
    }),
  )
  async uploadImage(
    @CurrentUser() user: JwtUser,
    @Body() body: UploadReviewImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');

    const eligibility = await this.reviewsService.getEligibility(
      user.sub,
      body.productId,
    );
    if (!eligibility.eligible) {
      throw new ForbiddenException(
        'Only eligible verified purchasers can upload review images',
      );
    }

    try {
      const result = await this.cloudinaryService.uploadFile(
        file,
        'achromatic/reviews',
      );
      return { url: result.secure_url, publicId: result.public_id };
    } catch {
      throw new ServiceUnavailableException(
        'Review image upload is temporarily unavailable',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('helpful-votes')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my helpful votes for a bounded review set' })
  getHelpfulVotes(
    @CurrentUser() user: JwtUser,
    @Query() query: HelpfulVotesQueryDto,
  ) {
    return this.reviewsService.findHelpfulVotes(user.sub, query.reviewIds);
  }

  @UseGuards(JwtAuthGuard)
  @Get('eligibility/:productId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check whether the current user can review a product',
  })
  getEligibility(
    @CurrentUser() user: JwtUser,
    @Param('productId') productId: string,
  ) {
    return this.reviewsService.getEligibility(user.sub, productId);
  }

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'List approved product reviews with pagination' })
  findByProduct(
    @Param('productId') productId: string,
    @Query() query: ReviewQueryDto,
  ) {
    return this.reviewsService.findByProduct(
      productId,
      query.page,
      query.limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/helpful')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle the current user helpful vote on a review' })
  toggleHelpful(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.reviewsService.toggleHelpful(id, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/approve')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Approve a product review' })
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Delete a product review' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
