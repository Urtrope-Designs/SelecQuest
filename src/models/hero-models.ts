import { CharStat } from "./models";

export interface HeroInitData {
    name: string;
    raceName: string;
    className: string;
    stats: CharStat[];
    gameSettingId: string;
}