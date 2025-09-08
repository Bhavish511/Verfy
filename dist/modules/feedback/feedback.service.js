"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const json_server_service_1 = require("../../services/json-server.service");
let FeedbackService = class FeedbackService {
    jsonServerService;
    constructor(jsonServerService) {
        this.jsonServerService = jsonServerService;
    }
    async createFeedback(userId, createFeedbackDto) {
        try {
            const feedback = {
                id: this.generateId(),
                userId: userId,
                stars: createFeedbackDto.stars,
                feedbackText: createFeedbackDto.feedbackText,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
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
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to submit feedback');
        }
    }
    generateId() {
        return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_server_service_1.JsonServerService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map