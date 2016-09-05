import {Injectable} from '@angular/core';
import {ICharacter} from '../models/character-types';

@Injectable()
export class CharacterFactoryService {
	public generateNewCharacter(inputCharacter: ICharacter): ICharacter {
		//TODO: go through each relevant attribute of ICharacter and see if inputCharacter has it; 
		/// if required and not present, throw an error
		/// if present, use the one from inputCharacter
		/// if not present and not required, set to "default"
		let fullCharacter: ICharacter;

		//required from inputCharacter
		if (!!inputCharacter.name) {
			console.error('CharacterFactoryService.generateNewCharacter() error: no character name provided');
			return null;
		}
		fullCharacter.name = inputCharacter.name;

		//optional input
		if (!!inputCharacter.race) {
			fullCharacter.race = inputCharacter.race;
		} else {
			fullCharacter.race = this.getRandomRace();
		}

		if (!!inputCharacter.class) {
			fullCharacter.class = inputCharacter.class;
		} else {
			fullCharacter.class = this.getRandomClass();
		}

		if (!!inputCharacter.attributes) {
			fullCharacter.attributes = inputCharacter.attributes;
		} else {
			fullCharacter.attributes = this.getRandomAttributes();
		}

		if (!!inputCharacter.pedigree) {
			fullCharacter.pedigree = inputCharacter.pedigree;
		} else {
			fullCharacter.pedigree = [];
		}

		//defaults - for now ignore input for these
		fullCharacter.currentHp = fullCharacter.maxHp = 20;
		fullCharacter.currentMp = fullCharacter.maxMp = 10;
		fullCharacter.maxEncumbrance = 30;
		fullCharacter.level = 1;
		fullCharacter.xp = fullCharacter.gold = fullCharacter.gossip = 0;
		fullCharacter.epithets = fullCharacter.taskHistory = fullCharacter.gear = fullCharacter.loot = fullCharacter.spells = fullCharacter.abilities = [];

		return fullCharacter;
	}
}