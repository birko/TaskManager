"use strict";
/** 
  * @desc TaskManager module to have a better control of running background tasks on website
  * @author František Bereň birko@live.com
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

    export function invokeScheduledTask(delay: number, priority: number, func: () => void, name: string = null, doCheckTask: boolean = true) {
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
            //console.log(`Scheduled Task Enqueued: ${name} as position ${index}. Scheduled Tasks in queue: ${scheduledTaskList.length}`);
            if (doCheckTask) {
                checkTasks();
            }
        }
    }

    export function invokeRepeatedTask(delay: number, priority: number, func: () => void, name: string = null, doCheckTask: boolean = true) {
        if (func !== undefined && func !== null) {
            invokeTask(priority, () => {
                invokeScheduledTask(delay, priority, () => {
                    invokeRepeatedTask(delay, priority, func, name);
                }, name);
                func();
            }, name, doCheckTask);
        }
    }

    export function invokeTask(priority: number, func: () => void, name: string = null, doCheckTask: boolean = true) {
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
            //console.log(`Task Enqueued: ${name} as position ${index}. Tasks in queue: ${taskList.length}`);
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
                    invokeTask(t.priority, t.func, t.name, false);
                }
            });
            scheduledTaskList = scheduledTaskList.filter(x => x.delay > 0);

            let batch = runTaskBatchSize;
            do {
                if (taskList.length > 0) {
                    const task = taskList.shift();
                    //console.log(`Starting task ${task.name}. Tasks in queue: ${taskList.length}`);
                    //console.time(task.name);
                    task.func();
                    batch--;
                    //console.timeEnd(task.name);
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

