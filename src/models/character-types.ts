import {ITask} from './task-types';
import {IGear, ILoot} from './reward-types';

export interface ICharacter {
	id: string,
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

export interface IAttribute {
	id: string,
	name: string,
	value: number
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