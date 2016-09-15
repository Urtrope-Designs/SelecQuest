import {RewardTypes} from './reward-types';

export interface ITask {
	id: string,
	name: string,
	primaryReward: RewardTypes,
	secondaryReward: RewardTypes,
	startTime: Date,
	endTime: Date,
	durationSeconds: number,
	isComplete: boolean

}

export enum QuestTypes {
	GLADIATING = 1,
	LOOTING,
	INVESTIGATING
}

