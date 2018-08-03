import taskMgr from './play-task-manager';

declare var Context: any;

Context.globalVar = 'test';
Context.taskMgr = taskMgr;