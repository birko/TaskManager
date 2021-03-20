# TaskManager
JavaScript library to manage and control backgroud tasks via window.Timeout

## Usage
### Include into your website as javascript source
```<script src="./TaskManager.js" type="text/javascript"></script>```

### API reference
 - **invokeTask(priority, function, name = null, doCheckTask = true)**<br>
 Invokes the void ```function``` with given number ```priority``` (less is better).
 ```Name``` is optional
 ```doCheckTask``` disables invoking the check of queued tasks after insert
 
 - **invokeScheduledTask(delay, priority, func, name = null, doCheckTask = true)**
 Similar to ```invokeTask```. The ```delay``` parameter gives the miliseconds timeout until the task is run
 
 - **getTaskList()**
 Returns list of tasks that will be run on next task check iteration
 
 - **getScheduledTaskList()**
 Returns list of scheduledc tasks that are waiting to be executed
 
 - **setBatchSize(size = 3)**
 Sets the count of task that are executed by one check iteration.
 Default: 3
 
 - **setCheckTaskDelay(delay = 24)**
 Sets the timeout in miliseconds  delay between next task check.
 <br>Default: 24 ms.

### Example
Just look at
[`Example`](https://github.com/birko/TaskManager/blob/master/index.html)
