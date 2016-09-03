export interface ICharacter {
	name: string,
	epithets: string[],
	pedigree: string[],
	race: string,
	class: string,
	level: number,
	xp: number,
	gold: number,
	gossip: number,
	maxEncumbrance: number,
	currentHp: number,
	maxHp: number,
	currentMp: number,
	maxMp: number,
	taskHistory: ITask[],
	attributes: IAttribute[],
	gear: IGear[],
	loot: ILoot[],
	spells: ISpell[],
	abilities: IAbility[]
}

export interface ITask {
	id: string,
	name: string
}

export interface IAttribute {
	id: string,
	name: string,
	value: number
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

export interface ISpell {
	id: string,
	name: string,
	level: number
}

export interface IAbility {
	id: string,
	name: string,
	level: number
}