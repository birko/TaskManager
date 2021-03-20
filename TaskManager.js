"use strict";
/**
  * @desc TaskManager module to have a better control of running background tasks on website
  * @author František Bereň <birko@live.com>
  * @see {@link https://github.com/birko/TaskManager}
  * @tutorial index.html
  * @version 1.0
*/
var TaskManager;
(function (TaskManager) {
    var checkTaskDelay = 24;
    var runTaskBatchSize = 3;
    var taskList = [];
    var scheduledTaskList = [];
    var isTaskRunning = false;
    var onTaskQueued = null;
    var onTaskStart = null;
    var onTaskEnd = null;
    var onScheduledTaskQueued = null;
    function setBatchSize(size = 3) {
        runTaskBatchSize = size;
    }
    TaskManager.setBatchSize = setBatchSize;
    function setCheckTaskDelay(delay = 24) {
        checkTaskDelay = delay;
    }
    TaskManager.setCheckTaskDelay = setCheckTaskDelay;
    function getTaskList() {
        return taskList;
    }
    TaskManager.getTaskList = getTaskList;
    function getScheduledTaskList() {
        return scheduledTaskList;
    }
    TaskManager.getScheduledTaskList = getScheduledTaskList;
    function setOnTaskStart(func) {
        onTaskStart = func;
    }
    TaskManager.setOnTaskStart = setOnTaskStart;
    function setOnTaskEnd(func) {
        onTaskEnd = func;
    }
    TaskManager.setOnTaskEnd = setOnTaskEnd;
    function setOnTaskQueued(func) {
        onTaskQueued = func;
    }
    TaskManager.setOnTaskQueued = setOnTaskQueued;
    function setOnScheduledTaskQueued(func) {
        onScheduledTaskQueued = func;
    }
    TaskManager.setOnScheduledTaskQueued = setOnScheduledTaskQueued;
    function invokeScheduledTask(func, delay, priority = 0, name = null, doCheckTask = true) {
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
            if (onScheduledTaskQueued !== null && onScheduledTaskQueued !== undefined) {
                onScheduledTaskQueued(task, index);
            }
            if (doCheckTask) {
                checkTasks();
            }
        }
    }
    TaskManager.invokeScheduledTask = invokeScheduledTask;
    function invokeRepeatedTask(func, delay, priority = 0, name = null, doCheckTask = true) {
        if (func !== undefined && func !== null) {
            invokeTask(() => {
                invokeScheduledTask(() => {
                    invokeRepeatedTask(func, delay, priority, name);
                }, delay, priority, name);
                func();
            }, priority, name, doCheckTask);
        }
    }
    TaskManager.invokeRepeatedTask = invokeRepeatedTask;
    function invokeTask(func, priority = 0, name = null, doCheckTask = true) {
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
            if (onTaskQueued !== null && onTaskQueued !== undefined) {
                onTaskQueued(task, index);
            }
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