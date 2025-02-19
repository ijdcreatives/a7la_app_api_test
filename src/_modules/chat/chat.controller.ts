import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Filter } from '../../decorators/param/filter.decorator';
import { PrismaService } from '../../globals/services/prisma.service';
import { ResponseService } from '../../globals/services/response.service';
import { Auth } from '../authentication/decorators/auth.decorator';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { CreateConversationDto, FilterConversationDto } from './dto/chat.dto';
import { ChatService } from './services/chat.service';
import { LocaleHeader } from '../authentication/decorators/locale.decorator';

const prefix = 'Chat';

@ApiTags(prefix)
@Controller(prefix.toLowerCase())
@Auth({})
export class ChatController {
  constructor(
    private readonly service: ChatService,
    private readonly responseService: ResponseService,
    private readonly prisma: PrismaService,
  ) {}

  // @Get('/:id')
  // @ApiQuery({ type: PartialType(FilterMessageDto) })
  // async findOne(
  //   @Res() res: Response,
  //   @Filter({ dto: FilterMessageDto }) filters: FilterMessageDto,
  // ) {
  //   console.log(filters);
  //   if (filters.id) {
  //     await this.prisma.returnUnique('conversation', 'id', filters.id);
  //   }
  //   const { messages, total } = await this.service.findMessages(filters);
  //   return this.responseService.success(
  //     res,locale,
  //     'conversations_fetched_successfully',
  //     messages,
  //     {
  //       total,
  //     },
  //   );
  // }

  @Get(['/', '/:id'])
  @ApiQuery({ type: PartialType(FilterConversationDto) })
  @Auth({})
  async findAll(
    @Res() res: Response,
    @Filter({ dto: FilterConversationDto }) filters: FilterConversationDto,
    @CurrentUser() CurrentUser: CurrentUser,
    @CurrentUser('role') role: Role,
    @LocaleHeader() locale: Locale,
  ) {
    if (filters.orderId) {
      const conversation = await this.service.findConversationByOrderId(
        role.baseRole,
        filters.orderId,
        CurrentUser.id,
      );
      return this.responseService.success(
        res,
        locale,
        'conversation_fetched_successfully',

        conversation,
      );
    }
    if (filters.id) {
      await this.prisma.returnUnique('conversation', 'id', filters.id);

      const { messages, total } = await this.service.findMessages(
        filters,
        CurrentUser.id,
      );
      return this.responseService.success(
        res,
        locale,
        'conversations_fetched_successfully',

        messages,
        {
          total,
        },
      );
    }
    const { conversations, total } = await this.service.findAll(
      filters,
      CurrentUser.id,
    );
    return this.responseService.success(
      res,
      locale,
      'conversations_fetched_successfully',

      conversations,
      {
        total,
      },
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Auth()
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser() currentUser: CurrentUser,
    @CurrentUser('role') role: Role,
  ) {
    await this.prisma.returnUnique(
      'user',
      'id',
      createConversationDto.receiverId,
    );

    return this.service.createConversationWithDto(
      createConversationDto,
      currentUser.id,
      role.baseRole,
    );
  }
}
