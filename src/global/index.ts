import taskMgr from '../services/play-task-manager';

declare var Context: any;

Context.globalVar = 'test';
Context.taskMgr = taskMgr;