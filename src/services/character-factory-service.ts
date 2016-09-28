import {Injectable} from '@angular/core';
import {ICharacter, IAttribute} from '../models/character-types';

@Injectable()
export class CharacterFactoryService {
	public generateRandomBaseCharacter(): ICharacter {
		let fullCharacter: ICharacter = {
			id: Date.now() + '',
			name: this.getRandomName(),
			epithets: [],
			pedigree: [],
			race: this.getRandomRace(),
			class: this.getRandomClass(),
			attributes: this.getRandomAttributes(),
			maxHp: 20,
			currentHp: 20,
			maxMp: 10,
			currentMp: 10,
			maxEncumbrance: 30,
			level: 1,
			xp: 0,
			gold: 0,
			gossip: 0,
			taskHistory: [],
			gear: [],
			loot: [],
			spells: [],
			abilities: []
		};

		return fullCharacter;
	}

	public getRandomAttributes(): IAttribute[] {
		let attributes = ALL_ATTRIBUTES.map((attr) => {
			let randVal = 8 + Math.floor(Math.random() * 11);
			let seededAttr = Object.assign({}, attr, {value: randVal});
			return seededAttr;
		})
		
		return attributes;
	}

	public getRandomClass(): string {
		let newClass: string;

		let randIndex = Math.floor(Math.random() * ALL_CLASSES.length);
		newClass = ALL_CLASSES[randIndex];

		return newClass;
	}

	public getRandomName(): string {
		let name: string;

		let randIndex = Math.floor(Math.random() * RANDOM_NAMES.length);
		name = RANDOM_NAMES[randIndex];

		return name;
	}

	public getRandomRace(): string {
		let race: string;

		let randIndex = Math.floor(Math.random() * ALL_RACES.length);
		race = ALL_RACES[randIndex];

		return race;
	}
}

const ALL_ATTRIBUTES: IAttribute[] = [
	{
		id: 'attr0',
		name: 'Brawn',
		value: -1
	},
	{
		id: 'attr1',
		name: 'Flexibility',
		value: -1
	},
	{
		id: 'attr2',
		name: 'Coordination',
		value: -1
	},
	{
		id: 'attr3',
		name: 'Resilience',
		value: -1
	},
	{
		id: 'attr4',
		name: 'Wit',
		value: -1
	},
	{
		id: 'attr5',
		name: 'Knowledge',
		value: -1
	},
	{
		id: 'attr6',
		name: 'Test-taking Skills',
		value: -1
	},
	{
		id: 'attr7',
		name: 'People Skills',
		value: -1
	}
];

const ALL_CLASSES = [
	'Tracker',
	'Stabber',
	'Tarp-folder',
	'Gold-doler'
];

const ALL_RACES = [
	'Rockperson',
	'Delf',
	'Roost-born',
	'Irishperson'
];

const RANDOM_NAMES = [
	'Slagrom',
	'Pookie',
	'Kent',
	'Chief',
	'Lillillellan',
	'Peg',
	'Marnf',
	'Tzleclac'
]