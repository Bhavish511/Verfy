import { Controller, Post, Get, UseGuards, Req, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createFeedback(@Req() req: any, @Body() createFeedbackDto: CreateFeedbackDto) {
    const userId = String(req.user?.id);
    return this.feedbackService.createFeedback(userId, createFeedbackDto);
  }
}
