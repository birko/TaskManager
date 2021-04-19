"use strict";
/** 
  * @desc TaskManager module to have a better control of running background tasks on website
  * @author František Bereň <birko@live.com>
  * @see {@link https://github.com/birko/TaskManager}
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
    var useAnimationFrame: boolean = false;
    var timeStamp: number;

    var onTaskQueued: (task: Task, index: number) => void = null;
    var onTaskStart: (task: Task) => void = null;
    var onTaskEnd: (task: Task) => void = null;
    var onScheduledTaskQueued: (task: ScheduledTask, index: number) => void = null;

    export function setUseAnimationFrame(value: boolean = false) {
        useAnimationFrame = value;
    }
    
    export function setBatchSize(size: number = 3) {
        runTaskBatchSize = size;
    }

    export function setCheckTaskDelay(delay: number = 24) {
        if (!useAnimationFrame) {
            checkTaskDelay = delay;
        } else {
            throw new Error("The useAnimationFrame option is set to 'true'");
        }
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

    export function setOnScheduledTaskQueued(func: (task: ScheduledTask, index: number) => void) {
        onScheduledTaskQueued = func;
    }

    export async function run(func: () => void): Promise<string> {
        return await invokeTask(func);
    }

    export async function invokeTask(func: () => void, priority: number = 0, name: string = null, doCheckTask: boolean = true): Promise<string> {
        if (func !== undefined && func !== null) {
            name = getTaskName(name);
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
                await onTaskQueued(task, index);
            }
            if (doCheckTask) {
                await checkTasks();
            }
            return name;
        }
        return null;
    }

    function getTaskName(name: string, prefix: string = "t") {
        if (name === null || name === undefined || name === "" || !name) {
            name = `${((prefix) ? prefix + "-" : "")}${Date.now()}`;
        }
        return name;
    }

    export async function setTimeout(func: () => void, delay: number): Promise<string> {
        return await invokeScheduledTask(func, delay);
    }

    export async function invokeScheduledTask(func: () => void, delay: number, priority: number = 0, name: string = null, doCheckTask: boolean = true) : Promise<string> {
        if (func !== undefined && func !== null) {
            name = getTaskName(name, "st");
            let task: ScheduledTask = {
                priority: priority,
                name: name,
                func: func,
                delay: delay
            };
            var index = scheduledTaskList.findIndex(x => x.delay > delay);
            if (index < 0) {
                scheduledTaskList.push(task);
                index = scheduledTaskList.length;
            } else {
                scheduledTaskList.splice(index, 0, task);
            }
            if (onScheduledTaskQueued !== null && onScheduledTaskQueued !== undefined) {
                await onScheduledTaskQueued(task, index);
            }
            if (doCheckTask) {
                await checkTasks();
            }
            return name;
        }
        return null;
    }

    export async function removeScheduledTask(name: string) {
        if (name !== undefined && name !== null && name !== "" && name) {
            const index = scheduledTaskList.findIndex(x => x.name === name);
            if (index >= 0) {
                scheduledTaskList.splice(index, 1);
                await checkTasks();
            }
        }
    }

    export async function clearTimeout(name: string) {
        removeScheduledTask(name);
    }

    export async function setInterval(func: () => void, delay: number, zeroTimeRun: boolean = false): Promise<string> {
        return await invokeRepeatedTask(func, delay, zeroTimeRun);
    }

    export async function invokeRepeatedTask(func: () => void, delay: number, zeroTimeRun: boolean = true, priority: number = 0, name: string = null, doCheckTask: boolean = true): Promise<string> {
        if (func !== undefined && func !== null) {
            name = getTaskName(name, "rt");
            await invokeTask(() => {
                invokeScheduledTask(() => {
                    invokeRepeatedTask(func, delay, true, priority, name);
                }, delay, priority, name);
                if (zeroTimeRun) {
                    func();
                }
            }, priority, name, doCheckTask);
            return name;
        }
        return null;
    }

    export async function removeRepeatedTask(name: string) {
        removeScheduledTask(name);
    }

    export async function clearInterval(name: string) {
        removeScheduledTask(name);
    }

    function getDelay(setTimeStamp: boolean = true): number {
        const now = Date.now();
        if (timeStamp === undefined || timeStamp === null) {
            timeStamp = now;
        }
        const elapsed = now - timeStamp;
        if (setTimeStamp) {
            timeStamp = now;
        }
        return elapsed;
    }

    async function checkTasks() {
        const elapsed = getDelay();
        if (!isTaskRunning && (taskList.length > 0 || scheduledTaskList.length > 0)) {
            isTaskRunning = true;
            scheduledTaskList.forEach((t) => {
                t.delay -= elapsed;
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
                        await onTaskStart(task);
                    }
                    await task.func();
                    if (onTaskEnd !== null && onTaskEnd !== undefined) {
                        await onTaskEnd(task);
                    }
                    batch--;
                } else {
                    batch = 0;
                }
            } while (batch > 0);

            if (taskList.length > 0 || scheduledTaskList.length > 0) {
                await scheduleCheck()
            }
            isTaskRunning = false;
        }
    }

    async function scheduleCheck() {
        if (useAnimationFrame) {
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(checkTasks);
            } else {
                window.setTimeout(checkTasks, 1000 / 60); //requestAnimationFrame framerate fallback
            }
        } else {
            window.setTimeout(checkTasks, checkTaskDelay);
        }
    }
}
