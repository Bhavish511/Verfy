import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JsonServerService } from '../../services/json-server.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

type Feedback = {
  id: string;
  userId: string | number;
  stars: number;
  feedbackText: string[];
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class FeedbackService {
  constructor(private readonly jsonServerService: JsonServerService) {}

  async createFeedback(userId: string, createFeedbackDto: CreateFeedbackDto) {
    try {
      const feedback: Feedback = {
        id: this.generateId(),
        userId: userId,
        stars: createFeedbackDto.stars,
        feedbackText: createFeedbackDto.feedbackText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to JSON server
      await this.jsonServerService.createFeedback(feedback);

      return {
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          id: feedback.id,
          stars: feedback.stars,
          feedbackText: feedback.feedbackText,
          submittedAt: feedback.createdAt,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to submit feedback');
    }
  }
  private generateId(): string {
    return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
