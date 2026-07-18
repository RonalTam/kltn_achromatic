import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  MaxLength,
} from 'class-validator';

function parseReviewIds(value: unknown): unknown {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((entry) =>
    typeof entry === 'string'
      ? entry
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : [],
  );
}

export class HelpfulVotesQueryDto {
  @Transform(({ value }) => parseReviewIds(value))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  reviewIds: string[];
}
