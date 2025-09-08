import { IsNumber, IsArray, IsString, IsOptional, Min, Max, ArrayMinSize } from 'class-validator';

export class CreateFeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  stars: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  feedbackText: string[];


}