export class HoatDongModel {
  id: number;
  code: string;
  name: string;
  parentCode: string;
  status: number;
  constructor(
    name: string,
    parentCode: string,
    status: number
  ) {
    this.name = name;
    this.parentCode = parentCode;
    this.status = status;
  }
}
