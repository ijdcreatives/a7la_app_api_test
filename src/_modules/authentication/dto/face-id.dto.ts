import { Required } from 'src/decorators/dto/required-input.decorator';

export class EnableFaceIdDTO {
  @Required()
  deviceId: string;
}
