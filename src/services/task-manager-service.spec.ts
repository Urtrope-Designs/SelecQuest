// /// <reference path="../../typings/jasmine.d.ts" />
// import {provide} from '@angular/core';
// import {beforeEachProviders, it, describe, expect, inject} from '@angular/core/testing';
// import {Store} from '@ngrx/store';
// import {Observable} from 'rxjs/Observable';
// import {TaskQueueingService} from './task-manager-service';
// import {TaskActions} from '../actions/task-actions';


// describe('TaskManagerService', () => {

// 	let selectStub;
// 	class StoreMock {
// 		constructor() {
// 			selectStub = spyOn(this, 'select').and.callThrough();
// 		}
// 		select() {
// 			return Observable.empty();
// 		}
// 	}

// 	let addTaskStub;
// 	class TaskActionsMock {
// 		constructor() {
// 			addTaskStub = spyOn(this, 'addTask');
// 		}
// 		addTask() {}
// 	}

// 	let generateTaskStub;
// 	let fakeTask = {
// 		name: 'Fake Task'
// 	}
// 	class TaskFactoryMock {
// 		constructor() {
// 			generateTaskStub = spyOn(this, 'generateTask').and.callThrough();
// 		}
// 		generateTask() {
// 			return fakeTask;
// 		}
// 	}

// 	beforeEachProviders(() => [
// 			TaskQueueingService,
// 			provide(Store, {useClass: StoreMock}),
// 			provide(TaskActions, {useClass: TaskActionsMock})
// 		]);

// 	afterEach(() => {
// 		selectStub.calls.reset();
// 		addTaskStub.calls.reset();
// 	})

// 	it('should add a new task if no active tasks exist in store.activeTasks', inject([TaskQueueingService], (taskSvc: TaskQueueingService) => {

// 	}));
// });