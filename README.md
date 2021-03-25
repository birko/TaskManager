# TaskManager
JavaScript library to manage and control backgroud tasks via ```window.setTimeout``` or ```window.requestAnimationFrame```

## Usage
### Include into your website as JavaScript source
```<script src="./TaskManager.js" type="text/javascript"></script>```

### API reference
 - **invokeTask(function, priority = 0, name = null, doCheckTask = true)**<br>
 Invokes the void ```function``` with given number ```priority``` (less is better).<br>
 ```Name``` is optional<br>
 ```doCheckTask``` disables invoking the check of queued tasks after insert
 
- **run(function)**<br>
 Alias for ```invokeTask```, without optional parameters 

 - **invokeScheduledTask(function, delay, priority = 0, name = null, doCheckTask = true)**<br>
 Similar to ```invokeTask```. The ```delay``` parameter gives the milliseconds timeout until the task is run

 - **setTimeout(function, delay)**<br>
 Alias for ```invokeScheduledTask```, without optional parameters 

 - **invokeRepeatedTask(func, delay, zeroTimeRun = true, priority = 0, name = null, doCheckTask = true)**<br>
Repeats calling ```function``` every ```delay``` milliseconds.<br>
```zeroTimeRun``` Boolean switch do invoke first iteration immediately.

 - **setInterval(function, delay, zeroTimeRun = false)**<br>
 Alias for ```invokeRepeatedTask```, without optional parameters 
 
 - **getTaskList()**<br>
 Returns list of tasks that will be run on next task check iteration<br>
 
 - **getScheduledTaskList()**<br>
 Returns list of scheduled tasks that are waiting to be executed<br>
 
 - **setBatchSize(size = 3)**<br>
 Sets the count of task that are executed by one check iteration.<br>
 Default: 3<br>
 
 - **setCheckTaskDelay(delay = 24)**<br>
 Sets the timeout in milliseconds delay between next task check.<br>
 Will throw error if ```setUseAnimationFrame``` was set to ```true```<br>
 Default: 24 ms.<br>

 - **setUseAnimationFrame(value = false)**<br>
 Uses ```window.requestAnimationFrame``` instead of windows.setTimeout.<br>
 ```setCheckTaskDelay``` will throw error if its called.<br>
 Default: false<br>

- **setOnTaskQueued(function)**<br>
Sets the monitor function ```(task, index)=>void```, that is triggered when task was queued into the list<br>

- **setOnScheduledTaskQueued(function)**<br>
Sets the monitor function ```(task, index)=>void```, that is triggered when task was queued into the scheduled list<br>

- **setOnTaskStart(function)**<br>
Sets the monitor function ```(task)=>void```, that is triggered when task is dequeued from list and invoked<br>

- **setOnTaskEnd(function)**<br>
Sets the monitor function ```(task)=>void```, that is triggered when task execuion ended<br>

### Example
Just look at
[`index.html`](https://github.com/birko/TaskManager/blob/master/index.html)
