import { GameSettingsManager } from "./game-settings-manager";
import { Adventure, HeroAbilityType } from "../models/hero-models";
import { IS_DEBUG, WEAPON_MATERIALS, SHEILD_MATERIALS, ARMOR_MATERIALS, EPITHET_DESCRIPTORS, EPITHET_BEING_ALL, TITLE_POSITIONS_ALL, SOBRIQUET_MODIFIERS, SOBRIQUET_NOUN_PORTION, HONORIFIC_TEMPLATES, STANDARD_GROUPS_INDEFINITE, OFFICE_POSITIONS_ALL } from "../global/config";
import { Hero, HeroModification, HeroModificationType, HeroEquipment, EquipmentType, EquipmentMaterial, HeroAccolade, AccoladeType, HeroTitlePosition, HeroAffiliation, HeroConnection } from "../models/models";
import { GameSetting } from "../global/game-setting";
import { randRange, randFromList, randFromListLow, getIterableEnumKeys, capitalizeInitial, randFromListHigh, generateRandomName } from "../global/utils";

export class PlayTaskResultGenerator {
    constructor(private gameSettingsMgr: GameSettingsManager) {
    }

    private generateNextAdventure(completedAdventure: Adventure): Adventure {
        const oldChapNumMatch = completedAdventure.name.match(/\d+$/);
        const oldChapNum = !!oldChapNumMatch ? +oldChapNumMatch[0] : 0;
        const newChapDuration = IS_DEBUG ? 60 : (60 * 60 * (1 + 5 * oldChapNum + 1));
        return {name: `Chapter ${oldChapNum + 1}`, progressRequired: newChapDuration};
    }
    
    public generateNewAdventureResults(currentHero: Hero, includeReward: boolean = true): HeroModification[] {
        const curGameSetting = this.gameSettingsMgr.getGameSettingById(currentHero.gameSettingId);
        let results = [
            {
                type: HeroModificationType.SET,
                attributeName: 'currentAdventure',
                data: this.generateNextAdventure(currentHero.currentAdventure),
            },
            {
                type: HeroModificationType.SET,
                attributeName: 'adventureProgress',
                data: 0,
            },
            {
                type: HeroModificationType.ADD,
                attributeName: 'completedAdventures',
                data: [currentHero.currentAdventure.name],
            },
        ];
        if (includeReward) {
            results.push(randRange(0, 1) ? this.generateNewEquipmentModification(currentHero) : PlayTaskResultGenerator.generateAbilityModification(currentHero, curGameSetting));
        }
        return results;
    }
    
    
    static generateAbilityModification(hero: Hero, curGameSetting: GameSetting, modValue: number = 1): HeroModification {
        const newAbilityType = randFromList(curGameSetting.abilityTypes);
        // pick a spell/ability early in the list, weighted toward 0
        const dataObj: HeroAbilityType = {
            name: newAbilityType.displayName,
            received: [
                {
                    name: randFromListLow(newAbilityType.availableValues, 2, hero.level + hero.stats[newAbilityType.baseStatIndex].value),
                    rank: modValue
                }
            ]
        };
        
        const mod: HeroModification = {
            type: HeroModificationType.ADD_RANK,
            attributeName: 'abilities',
            data: dataObj,
        }
        
        return mod;
    }
    
    public generateNewEquipmentModification(hero: Hero): HeroModification {
        const newEquipmentData = this.generateRandomEquipment(hero.level);
        
        const mod: HeroModification = {
            type: HeroModificationType.SET_EQUIPMENT,
            attributeName: 'equipment',
            data: [newEquipmentData],
        };
    
        return mod;
    }
    
    private generateRandomEquipment(targetLevel: number): HeroEquipment {
        //     randomly pick equipment type
        const newEquipmentType: EquipmentType = EquipmentType[randFromList(Object.keys(EquipmentType))];
        // 2. randomly pick 5 items of selected equipment type, & pick the one closest to hero level
        let targetList: EquipmentMaterial[];
        if (newEquipmentType == EquipmentType.Weapon) {
            targetList = WEAPON_MATERIALS;
        } else if (newEquipmentType == EquipmentType.Shield) {
            targetList = SHEILD_MATERIALS;
        } else {
            targetList = ARMOR_MATERIALS;
        }
        
        let material = randFromList(targetList);
        for (let i = 0; i <= 5; i++) {
            let compare = randFromList(targetList);
            if (Math.abs(targetLevel - material.baseLevel) > Math.abs(targetLevel - compare.baseLevel)) {
                material = compare;
            }
        }
    
        // 3. add up to 2 modifiers (no duplicates) to bring quality of selected item closer to hero level (don't allow it to go over)
        let qualityDifference = targetLevel - material.baseLevel;
        let newEquipmentDescription = material.description;
        for (let i = 0; i < 2 && qualityDifference != 0; i++) {
            const modifier = randFromList(material.modifierList.filter(i => qualityDifference > 0 ? i.levelModifier >= 0 : i.levelModifier < 0));
            if (newEquipmentDescription.includes(modifier.description)) {
                //no repeats
                break;
            }
            if (Math.abs(qualityDifference) < Math.abs(modifier.levelModifier)) {
                // too much
                break;
            }
    
            newEquipmentDescription = `${modifier.description} ${newEquipmentDescription}`;
            qualityDifference -= modifier.levelModifier;
        }
        
        // 4. add remainder of difference (between quality of item adjusted by mods and hero level) as numeric modifier.
        if (qualityDifference != 0) {
            newEquipmentDescription = `${qualityDifference > 0 ? '+' : ''}${qualityDifference} ${newEquipmentDescription}`;
        }
    
        const newEquipment = {
            type: newEquipmentType,
            description: newEquipmentDescription,
        };
    
        return newEquipment;
    }
    
    public generateNewAccoladeModification(hero: Hero): HeroModification {
        const newAccoladeData = this.generateRandomAccolade(hero);
        
        const mod: HeroModification = {
            type: HeroModificationType.ADD_ACCOLADE,
            attributeName: 'accolades',
            data: [newAccoladeData],
        };
    
        return mod;
    }
    
    private generateRandomAccolade(hero: Hero): HeroAccolade {
        const newAccoladeType = AccoladeType[randFromList(getIterableEnumKeys(AccoladeType))];
        let newAccoladeDescription = '';
        let exclusions: string = '';
        switch(newAccoladeType) {
            case AccoladeType.Epithets:
                exclusions = hero.accolades.find(accolade => accolade.type == AccoladeType.Epithets).received.join(' ');
                newAccoladeDescription = this.generateRandomEpithetDescription(exclusions);
                break;
            case AccoladeType.Titles:
                exclusions = hero.accolades.find(accolade => accolade.type == AccoladeType.Titles).received.join(' ');
                newAccoladeDescription = this.generateRandomTitleDescription(exclusions);
                break;
                case AccoladeType.Sobriquets:
                exclusions = hero.accolades.find(accolade => accolade.type == AccoladeType.Sobriquets).received.join(' ');
                newAccoladeDescription = this.generateRandomSobriquetDescription(exclusions);
                break;
                case AccoladeType.Honorifics:
                exclusions = hero.accolades.find(accolade => accolade.type == AccoladeType.Honorifics).received.join(' ');
                newAccoladeDescription = this.generateRandomHonorificDescription(exclusions, hero.level, hero.name);
                break;
        }
    
        const newAccolade = {
            type: newAccoladeType,
            received: [newAccoladeDescription]
        }
    
        return newAccolade;
    }
    
    private generateRandomEpithetDescription(exclusions: string) {
        let epithetDescriptor: string;
        let epithetBeing: string;
    
        do {
            epithetDescriptor = randFromList(EPITHET_DESCRIPTORS);
        } while (exclusions.toLocaleLowerCase().includes(epithetDescriptor.toLocaleLowerCase()));
        do {
            epithetBeing = randFromList(EPITHET_BEING_ALL);
        } while (exclusions.toLocaleLowerCase().includes(epithetBeing.toLocaleLowerCase()));
    
        let epithetDescription = `${epithetDescriptor} ${epithetBeing}`;
        return epithetDescription;
    };
    private generateRandomTitleDescription(exclusions: string) {
        let titlePosition: HeroTitlePosition;
        let titleObject: string;
        do {
            titlePosition = randFromList(TITLE_POSITIONS_ALL);
        } while (exclusions.toLocaleLowerCase().includes(titlePosition.description.toLocaleLowerCase()));
        do {
            titleObject = randFromList(titlePosition.titleObjectList);
        } while (exclusions.toLocaleLowerCase().includes(titleObject.toLocaleLowerCase()));
    
        const titleDescription = `${titlePosition.description} of ${titleObject}`;
    
        return titleDescription;
    }
    private generateRandomSobriquetDescription(exclusions: string) {
        let modifier = ''
        do {
            modifier = randFromList(SOBRIQUET_MODIFIERS);
        } while (exclusions.toLocaleLowerCase().includes(modifier.toLocaleLowerCase()));
    
        // one or two (twice as likely) SOBRIQUET_NOUN_PORTIONs
        let noun = '';
        for (let i = 0; i < (randRange(0, 2) || 2); i++) {
            let nounPortion = '';
            do {
                nounPortion = randFromList(SOBRIQUET_NOUN_PORTION);
            } while (exclusions.toLocaleLowerCase().includes(nounPortion.toLocaleLowerCase()) || noun.toLocaleLowerCase().includes(nounPortion.toLocaleLowerCase()));
            noun += nounPortion;
        }
    
        const sobriquetDescription = `${modifier} ${capitalizeInitial(noun)}`;
        return sobriquetDescription;
    }
    private generateRandomHonorificDescription(exclusions: string, targetLevel: number, heroName: string) {
        let honorificTemplate: string;
        let honorificDescription: string;
        
        const deviation = 4;
        const minIndex = Math.min(targetLevel - deviation, HONORIFIC_TEMPLATES.length - deviation);
        const maxIndex = Math.max(targetLevel + deviation, deviation);
        do {
            honorificTemplate = randFromListHigh(HONORIFIC_TEMPLATES, 1, minIndex, maxIndex);
            honorificDescription = honorificTemplate.replace('%NAME%', heroName);
        } while (exclusions.toLocaleLowerCase().includes(honorificDescription.toLocaleLowerCase()));
        
        return honorificDescription;
    }
    
    public generateNewAffiliationModification(hero: Hero): HeroModification {
        const newAffiliationData = this.generateRandomAffiliation(hero);
    
        const mod = {
            type: HeroModificationType.ADD_AFFILIATION,
            attributeName: 'affiliations',
            data: [newAffiliationData],
        };
    
        return mod;
    }
    
    private generateRandomAffiliation(hero: Hero): HeroAffiliation {
        let newAffiliationData: HeroAffiliation;
    
        let newAffiliationFactories: ((existingAffiliations: HeroAffiliation[]) => HeroAffiliation)[] = [];
        if (hero.affiliations.length < STANDARD_GROUPS_INDEFINITE.length) {
            newAffiliationFactories.push(this.generateRandomDistinctConnection);
            newAffiliationFactories.push(this.generateRandomDistinctConnection); // double the odds
        }
        if (hero.affiliations.some(a => a.office == null)) {
            newAffiliationFactories.push(this.generateRandomDistinctMembership);
            newAffiliationFactories.push(this.generateRandomDistinctMembership); // double the odds
        }
        if (hero.affiliations.some(a => this.isNonNullNonHighestOffice(a.office))) {
            newAffiliationFactories.push(this.generateRandomDistinctHigherOffice);
        }
    
        
        let selectedFactory = randFromList(newAffiliationFactories);
        newAffiliationData = selectedFactory(hero.affiliations);
    
        return newAffiliationData;
    }
    
    
    private generateRandomDistinctConnection(existingAffiliations: HeroAffiliation[]): HeroAffiliation {
        const availableDistinctGroups: string[] = STANDARD_GROUPS_INDEFINITE.filter((groupName: string) => {
            return !existingAffiliations.some(a => a.groupName == groupName);
        });
    
        if (availableDistinctGroups.length === 0) {
            return nullAffiliation;
        }
        
        const newConnectionName = generateRandomName();
        const newConnectionTitle = randFromList(OFFICE_POSITIONS_ALL.slice(1));
        const newGroupName = randFromList(availableDistinctGroups);
        const newConnection: HeroConnection = {
            personName: newConnectionName,
            personTitle: newConnectionTitle,
        }
        const returnData: HeroAffiliation = {
            groupName: newGroupName,
            connection: newConnection,
            office: null,
        }
        return returnData;
    }
    
    private generateRandomDistinctMembership(existingAffiliations: HeroAffiliation[]): HeroAffiliation {
        // list of all groups we have a connection with but don't currently have membership (ie, an office)
        const availableMembershipGroups: string[] = existingAffiliations.filter(a => a.office == null).map(a => a.groupName);
    
        if (availableMembershipGroups.length === 0) {
            return nullAffiliation;
        }
    
        const newMembershipGroupName = randFromList(availableMembershipGroups);
        const newOffice = OFFICE_POSITIONS_ALL[0];
        const returnData: HeroAffiliation = {
            groupName: newMembershipGroupName,
            office: newOffice,
            connection: null,
        }
        return returnData;
    }
    
    private generateRandomDistinctHigherOffice(existingAffiliations: HeroAffiliation[]): HeroAffiliation {
        // list of all groups with a non-null office that is also not the highest office
        const availableOfficeGroups: string[] = existingAffiliations.filter(a => this.isNonNullNonHighestOffice(a.office)).map(a => a.groupName);
        if (availableOfficeGroups.length === 0) {
            return nullAffiliation;
        }
        const group = randFromList(availableOfficeGroups);
        
        const existingAffiliation: HeroAffiliation = existingAffiliations.find(a => a.groupName == group);
        // list of all positions higher than currently "held" office, non-dup with the same group's Connection
        const availableOfficePositions: string[] = OFFICE_POSITIONS_ALL.slice(OFFICE_POSITIONS_ALL.indexOf(existingAffiliation.office) + 1).filter(o => {
                return o != existingAffiliation.connection.personTitle;
            });
        
        const newOffice = randFromListLow(availableOfficePositions, 3);
        const returnData: HeroAffiliation = {
            groupName: group,
            office: newOffice,
            connection: null,
        }
        return returnData;
    }
    
    private isNonNullNonHighestOffice(officeName: string) {
        return !!officeName && OFFICE_POSITIONS_ALL.indexOf(officeName) < (OFFICE_POSITIONS_ALL.length - 1)
    }
}

const nullAffiliation: HeroAffiliation = {
    groupName: null,
    connection: null,
    office: null,
}
