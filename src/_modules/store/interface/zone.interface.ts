import { PointDTO } from '../dto/store.dto';

export interface Zone {
  nameAr: string;
  nameEn: string;
  displayAr: string;
  displayEn: string;
  point: PointDTO;
}
