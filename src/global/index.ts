import taskMgr from './task-manager';

declare var Context: any;

Context.globalVar = 'test';
Context.taskMgr = taskMgr;