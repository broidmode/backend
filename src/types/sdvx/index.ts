import { Binary } from "mongodb";

export interface PlayerPlayData {
  _id: string;
  name: string;
  save_data: Binary;
}
