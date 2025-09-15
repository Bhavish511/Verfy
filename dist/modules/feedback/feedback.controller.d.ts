import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    createFeedback(req: any, createFeedbackDto: CreateFeedbackDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            stars: number;
            feedbackText: string[];
            submittedAt: string;
        };
    }>;
}
