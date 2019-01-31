import { HeroStat } from "./models";

export interface HeroInitData {
    name: string;
    raceName: string;
    className: string;
    stats: HeroStat[];
    gameSettingId: string;
}