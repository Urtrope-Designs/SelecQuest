/// <reference path="../../typings/jasmine.d.ts" />
import {beforeEachProviders, it, describe, expect, inject} from '@angular/core/testing';
import {TaskFactoryService} from './task-factory-service';
import {QuestTypes} from '../models/task-types'; 
import {RewardTypes} from '../models/reward-types';

describe('Task Factory Service', () => {
 
    beforeEachProviders(() => [TaskFactoryService]);

    it('should generate a valid ITask when passed QuestTypes.GLADIATING', inject([TaskFactoryService], (taskFactory: TaskFactoryService) => {
 		let newTask = taskFactory.generateTask(QuestTypes.GLADIATING);

        expect(newTask.id).toBeDefined();
        expect(newTask.name).toBeDefined();
        expect(newTask.primaryReward).toBeDefined();
        expect(newTask.secondaryReward).toBeDefined();
        expect(newTask.duration).toBeDefined();
 
    }));

    it('should generate a Task with primaryReward of RewardTypes.XP when passed QuestTypes.Gladiating', inject([TaskFactoryService], (taskFactory: TaskFactoryService) => {
    	let newTask = taskFactory.generateTask(QuestTypes.GLADIATING);

    	expect(newTask.primaryReward).toEqual(RewardTypes.XP);
    }));

    it('should generate a Task with secondaryReward of either GOLD or GOSSIP when passed GLADIATING', inject([TaskFactoryService], (taskFactory: TaskFactoryService) => {
    	let newTask = taskFactory.generateTask(QuestTypes.GLADIATING);

    	expect(newTask.secondaryReward === RewardTypes.GOLD || newTask.secondaryReward === RewardTypes.GOSSIP).toBeTruthy();
    }));

    it('should generate a Task with "random" primary and secondaryReward when passed null', inject([TaskFactoryService], (taskFactory: TaskFactoryService) => {
    	spyOn(Math, 'random').and.returnValues(0, .1, 0, .5, 0, .9);

    	let newTask1 = taskFactory.generateTask(null);
    	let newTask2 = taskFactory.generateTask(null);
    	let newTask3 = taskFactory.generateTask(null);

    	expect(newTask1.primaryReward).toEqual(RewardTypes.XP);
    	expect(newTask2.primaryReward).toEqual(RewardTypes.GOLD);
    	expect(newTask3.primaryReward).toEqual(RewardTypes.GOSSIP);
    }))
 
});