"use strict";
var TaskManager;
(function (TaskManager) {
    var checkTaskDelay = 24;
    var runTaskBatchSize = 3;
    var taskList = [];
    var scheduledTaskList = [];
    var isTaskRunning = false;
    function setBatchSize(size = 3) {
        runTaskBatchSize = size;
    }
    TaskManager.setBatchSize = setBatchSize;
    function setCheckTaskDelay(delay = 3) {
        checkTaskDelay = delay;
    }
    TaskManager.setCheckTaskDelay = setCheckTaskDelay;
    function invokeScheduledTask(delay, priority, func, name = null, doCheckTask = true) {
        if (func !== undefined && func !== null) {
            let task = {
                priority: priority,
                name: name,
                func: func,
                delay: delay + checkTaskDelay, // + for first check cycle
            };
            var index = scheduledTaskList.findIndex(x => x.delay > delay);
            if (index < 0) {
                scheduledTaskList.push(task);
                index = scheduledTaskList.length;
            }
            else {
                scheduledTaskList.splice(index, 0, task);
            }
            //console.log(`Scheduled Task Enqueued: ${name} as position ${index}. Scheduled Tasks in queue: ${scheduledTaskList.length}`);
            if (doCheckTask) {
                checkTasks();
            }
        }
    }
    TaskManager.invokeScheduledTask = invokeScheduledTask;
    function invokeTask(priority, func, name = null, doCheckTask = true) {
        if (func !== undefined && func !== null) {
            let task = {
                priority: priority,
                name: name,
                func: func
            };
            var index = taskList.findIndex(x => x.priority > priority);
            if (index < 0) {
                taskList.push(task);
                index = taskList.length;
            }
            else {
                taskList.splice(index, 0, task);
            }
            //console.log(`Task Enqueued: ${name} as position ${index}. Tasks in queue: ${taskList.length}`);
            if (doCheckTask) {
                checkTasks();
            }
        }
    }
    TaskManager.invokeTask = invokeTask;
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
                }
                else {
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
})(TaskManager || (TaskManager = {}));
//# sourceMappingURL=TaskManager.js.map