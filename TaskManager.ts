"use strict";
/** 
  * @desc TaskManager module to have a better control of running background tasks on website
  * @author František Bereň <birko@live.com>
  * @see https://github.com/birko/TaskManager
  * @tutorial index.html
  * @version 1.0
*/
module TaskManager {
    export interface Task {
        priority: number;
        name: string;
        func: () => void;
    }
    
    export interface ScheduledTask extends Task {
        delay: number;
    }

    var checkTaskDelay: number = 24;
    var runTaskBatchSize: number = 3;
    var taskList: Task[] = [];
    var scheduledTaskList: ScheduledTask[] = []
    var isTaskRunning: boolean = false;

    var onTaskQueued: (task: Task, index: number) => void = null;
    var onTaskStart: (task: Task) => void = null;
    var onTaskEnd: (task: Task) => void = null;
    var onScheduledTaskQueued: (task: ScheduledTask, index: number) => void = null;

    export function setBatchSize(size: number = 3) {
        runTaskBatchSize = size;
    }

    export function setCheckTaskDelay(delay: number = 24) {
        checkTaskDelay = delay;
    }

    export function getTaskList() {
        return taskList;
    }

    export function getScheduledTaskList() {
        return scheduledTaskList;
    }

    export function setOnTaskStart(func: (task: Task) => void) {
        onTaskStart = func;
    }

    export function setOnTaskEnd(func: (task: Task) => void) {
        onTaskEnd = func;
    }

    export function setOnTaskQueued(func: (task: Task, index: number) => void) {
        onTaskQueued = func;
    }

    export function setOnScheduledTaskQueued(func: (task: Task, index: number) => void) {
        onScheduledTaskQueued = func;
    }

    export function invokeScheduledTask(func: () => void, delay: number, priority: number = 0, name: string = null, doCheckTask: boolean = true) {
        if (func !== undefined && func !== null) {
            let task: ScheduledTask = {
                priority: priority,
                name: name,
                func: func,
                delay: delay + checkTaskDelay, // + for first check cycle
            };
            var index = scheduledTaskList.findIndex(x => x.delay > delay);
            if (index < 0) {
                scheduledTaskList.push(task);
                index = scheduledTaskList.length;
            } else {
                scheduledTaskList.splice(index, 0, task);
            }
            if (onScheduledTaskQueued !== null && onScheduledTaskQueued !== undefined) {
                onScheduledTaskQueued(task, index);
            }
            if (doCheckTask) {
                checkTasks();
            }
        }
    }

    export function invokeRepeatedTask(func: () => void, delay: number, priority: number = 0, name: string = null, doCheckTask: boolean = true) {
        if (func !== undefined && func !== null) {
            invokeTask(() => {
                invokeScheduledTask(() => {
                    invokeRepeatedTask(func, delay, priority, name);
                }, delay, priority, name);
                func();
            }, priority, name, doCheckTask);
        }
    }

    export function invokeTask(func: () => void, priority: number = 0, name: string = null, doCheckTask: boolean = true) {
        if (func !== undefined && func !== null) {
            let task: Task = {
                priority: priority,
                name: name,
                func: func
            };
            var index = taskList.findIndex(x => x.priority > priority);
            if (index < 0) {
                taskList.push(task);
                index = taskList.length;
            } else {
                taskList.splice(index, 0, task);
            }
            if (onTaskQueued !== null && onTaskQueued !== undefined) {
                onTaskQueued(task, index);
            }
            if (doCheckTask) {
                checkTasks();
            }
        }
    }

    function checkTasks() {
        if (!isTaskRunning && (taskList.length > 0 || scheduledTaskList.length > 0)) {
            isTaskRunning = true;
            scheduledTaskList.forEach((t) => {
                t.delay -= checkTaskDelay;
                if (t.delay <= 0) {
                    invokeTask(t.func, t.priority, t.name, false);
                }
            });
            scheduledTaskList = scheduledTaskList.filter(x => x.delay > 0);

            let batch = runTaskBatchSize;
            do {
                if (taskList.length > 0) {
                    const task = taskList.shift();
                    if (onTaskStart !== null && onTaskStart !== undefined) {
                        onTaskStart(task);
                    }
                    task.func();
                    if (onTaskEnd !== null && onTaskEnd !== undefined) {
                        onTaskEnd(task);
                    }
                    batch--;
                } else {
                    batch = 0;
                }
            } while (batch > 0);

            if (taskList.length > 0 || scheduledTaskList.length > 0) {
                setTimeout(function () {
                    checkTasks();
                }, checkTaskDelay);
            }
            isTaskRunning = false;
        }
    }
}