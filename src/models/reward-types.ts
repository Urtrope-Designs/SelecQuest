export enum RewardTypes {
	XP = 1,
	GOLD,
	GOSSIP
}

export interface IGear {
	category: string,
	id: string,
	name: string
}

export interface ILoot {
	id: string,
	name: string,
	baseValue: number,
	quantity: number
}