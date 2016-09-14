import {Injectable} from '@angular/core';
import {ITask, QuestTypes} from '../models/task-types';
import {RewardTypes} from '../models/reward-types';

@Injectable()
export class TaskFactoryService {
	public generateTask(type: QuestTypes): ITask {
		let newTask: ITask;

		let primaryReward: RewardTypes;
		let secondaryReward: RewardTypes;
		let rando = Math.random();

		if (!type) {
			let rand1to3 = Math.floor(Math.random() * 3) + 1;
			type = QuestTypes[QuestTypes[rand1to3]];
		}

		switch(type) {
			case QuestTypes.GLADIATING:
				primaryReward = RewardTypes.XP;
				secondaryReward = rando < .5 ? RewardTypes.GOLD : RewardTypes.GOSSIP;
				break;
			case QuestTypes.LOOTING:
				primaryReward = RewardTypes.GOLD;
				secondaryReward = rando < .5 ? RewardTypes.XP : RewardTypes.GOSSIP;
				break;
			case QuestTypes.INVESTIGATING:
				primaryReward = RewardTypes.GOSSIP;
				secondaryReward = rando < .5 ? RewardTypes.GOLD : RewardTypes.XP;
				break;
			default:
				console.log('taskFactory.generateTask error: should be able to get to default case');
		}

		newTask = {
			id: 'task:' + Date.now(),
			name: this.getRandomName(type),
			primaryReward: RewardTypes.GOLD,
			secondaryReward: RewardTypes.GOSSIP,
			duration: 6
		};

		return newTask;
	}

	public getRandomName(type: QuestTypes): string {
		return 'Fix something';
	}
}
