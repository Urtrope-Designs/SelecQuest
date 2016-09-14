import {RewardTypes} from './reward-types';

export interface ITask {
	id: string,
	name: string,
	primaryReward: RewardTypes,
	secondaryReward: RewardTypes,
	duration: number
}

export enum QuestTypes {
	GLADIATING = 1,
	LOOTING,
	INVESTIGATING
}

