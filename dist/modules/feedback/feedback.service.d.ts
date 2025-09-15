import { JsonServerService } from '../../services/json-server.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
export declare class FeedbackService {
    private readonly jsonServerService;
    constructor(jsonServerService: JsonServerService);
    createFeedback(userId: string, createFeedbackDto: CreateFeedbackDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            stars: number;
            feedbackText: string[];
            submittedAt: string;
        };
    }>;
    private generateId;
}
