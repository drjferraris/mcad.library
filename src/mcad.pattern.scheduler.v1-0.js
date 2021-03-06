/**
 * @fileOverview Contains the MCAD Pattern Scheduler class.
 * @name MCAD Pattern Scheduler
 * @version 1.0
 */

/**
 * The position stamp of a step on the timeline (all values are 0-based).<br>
 * <i>Position stamps should only be created and modified with the appropriate step stamp methods (create, clone, offset) and never directly.</i>
 * @typedef  {object} StepStamp
 * @property {number} bar         - the bar position of this step (the pattern is one bar on length).
 * @property {number} beat        - the beat position of this step in the pattern.
 * @property {number} step        - the step position of this step in the beat.
 * @property {number} patternPos  - the step position of this step in the pattern.
 * @property {number} guid        - the unique absolute position of this step in playback.
 * @example <caption>A pattern of 4 beats of 1/16th notes</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx); 
 * 
 * // Values are 0-based (0 = 1st, 1 = 2nd, etc.)
 * myStepStamp = scheduler.createStepStamp(1,3,0); // 2nd bar, 4th beat, 1st step, patternPos = 12, guid = 28
*/

/**
  * The time stamp of a step on the timeline.<br>
  * <i>Time stamps should only be created and modified with the appropriate time stamp methods (create, clone) and never created or copied directly.</i>
  * @typedef  {object} TimeStamp
  * @property {number} straight - the absolute straight time position of a step.
  * @property {number} swing    - the absolute swung time position of a step.
*/

/**
 * The event handler callback functions for events triggered by the scheduler.
 * @typedef  {object} ScheduleEventHandler
 * @property {function} [onQueue] - triggered when a step has been queued up for playback. Has two arguments: a {@linkcode timeStamp} and {@linkcode stepStamp} for the step to be queued.
 * @property {function} [onAnim]  - triggered when the playback position meets a queued step (used for animating steps). Has two arguments: a {@linkcode stepStamp} for the current step to animate and a {@linkcode stepStamp} for the previous step that was animated.
 * @property {function} [onTween] - triggered every render frame. Has one argument: the normalized playback position within the bar in the {@linkcode [0,1]} range.
 * @example <caption>Logging event handler arguments</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {onQueue: queueStep, onAnim: animateStep, onTween: tweenPattern});
 *
 * // Start playback 
 * scheduler.start();
 *
 * // onQueue event handler
 * function queueStep(timeStamp, stepStamp) {
 *     
 *     console.log("timeStamp.straight: " + timeStamp.straight);
 *     console.log("timeStamp.swing: " + timeStamp.swing);
 * 
 *     console.log("stepStamp.bar: " + stepStamp.bar);
 *     console.log("stepStamp.beat: " + stepStamp.beat);
 *     console.log("stepStamp.step: " + stepStamp.step);
 *     console.log("stepStamp.patternPos: " + stepStamp.patternPos);
 *     console.log("stepStamp.guid: " + stepStamp.guid);
 * }
 *
 * // onAnim event handler
 * function animateStep(currentStepStamp, previousStepStamp) {
 *     
 *     console.log("currentStepStamp.bar: " + currentStepStamp.bar);
 *     console.log("currentStepStamp.beat: " + currentStepStamp.beat);
 *     console.log("currentStepStamp.step: " + currentStepStamp.step);
 *     console.log("currentStepStamp.patternPos: " + currentStepStamp.patternPos);
 *     console.log("currentStepStamp.guid: " + currentStepStamp.guid);
 *
 *     console.log("previousStepStamp.bar: " + previousStepStamp.bar);
 *     console.log("previousStepStamp.beat: " + previousStepStamp.beat);
 *     console.log("previousStepStamp.step: " + previousStepStamp.step);
 *     console.log("previousStepStamp.patternPos: " + previousStepStamp.patternPos);
 *     console.log("previousStepStamp.guid: " + previousStepStamp.guid);
 * }
 * 
 * // onTween event handler
 * function tweenPattern(tween) {
 *     console.log("tween: " + tween);
 * }
*/

/**
 * Constructs a scheduler object.
 * @class
 * @classdesc A pattern-based scheduler for queuing and animating pattern steps and smooth playback position tweening. The scheduler will post events containing step time stamps for when a step is ready to be queued up for playback and when the playback head reaches a step for animating along with a smooth, continuous playback position for smooth, custom playback animations. 
 * @param {!AudioContext} context                   - the audio context to use
 * @param {?object} options                         - config options to override defaults.
 * @param {number} [options.tempo=60]               - playback tempo.
 * @param {number} [options.stepsPerBeat=4]         - number of steps in a beat.
 * @param {number} [options.beatsPerPattern=4]      - number of beats in a bar/pattern.
 * @param {number} [options.maxSwing=0.5]           - maximum swing time of step length.
 * @param {number} [options.scheduleAheadTime=0.02] - time (in seconds) the sceduler will look ahead to queue up steps for playback.
 * @param {number} [options.lookAheadTime=0.01]     - time (in seconds) the sceduler will trigger another schedule event.
 * @param {number} [options.onQueue=null]           - event handler for queueing up steps for playback.
 * @param {number} [options.onAnim=null]            - event handler for animating steps during playback.
 * @param {number} [options.onTween=null]           - event handler for tweening smooth animations during playback.
 * @example <caption>4/4 time with 1/16th steps at a tempo of 120bpm</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120}); 
 * @example <caption>2/4 time with 1/8th steps at a tempo of 60bpm with an event handler for playing steps</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {beatsPerPattern: 2, stepsPerBeat: 2, onQueue: queueStep}); 
 * @example <caption>5/8 time with 1/32nd steps at a tempo of 96pm with event handlers for playing and animating steps</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {beatsPerPattern: 5, stepsPerBeat: 8, tempo: 96, onQueue: queueStep, onAnim: animateStep}); 
 * @example <caption>Default values and no event handlers</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx); 
 */
function Scheduler(context, options) {

    //-------------------------------------------------------------------------------------------------------------------------------------
    console.info("@@0@@Scheduler.Scheduler@@Creating Scheduler instance...");
    //-------------------------------------------------------------------------------------------------------------------------------------
    
    if(context === null) throw new TypeError("(Scheduler.Scheduler) Invalid AudioContext (did you make a typo or forget to create the context?");

    /** 
     * Initial project tempo. 
     * @type {!number}
     * @default 60
     */
    this.tempo = 60;    
    
    /** 
     * Number of pattern steps in a beat. 
     * @type {!number}
     * @default 4
     */
    this.stepsPerBeat = 4;

    /** 
     * Number of beats in a pattern. 
     * @type {!number}
     * @default 4
     */
    this.beatsPerPattern = 4;
    
    /** 
     * Amount of swing to apply {@linkcode [0,1]} to even numbered steps. Used as multiplier for {@linkcode maxSwing}. 
     * @type {!number}
     * @default 0
     */
    this.swing = 0;
    
    /** 
     * Maximum swing length (in steps) to be applied (final swing = {@linkcode swing} * {@linkcode maxSwing}). 
     * @type {!number}
     * @default 0.5
     */
    this.maxSwing = 0.5;
    
    /** 
     * Flag to signify whether or not we are currently playing back a pattern sequence. 
     * @type {boolean}
     * @readonly 
     * @default false
     */
    this.isPlaying = false;
    
    /** 
     * Flag to signify whether or not we will restart or resume the play postion on playback. 
     * @type {!boolean}
     * @default false
     */
    this.resumePlayback = false;
    
    /** 
     * Step position to resume playback (set by {@linkcode stop()} method). 
     * @type {StepStamp}
     * @readonly 
     */
    this.resumeStamp = this.createStepStamp(0,0,0);
	
	/** 
     * Step position that playback was stopped on (set by  {@linkcode stop()} method). 
     * @type {StepStamp}
     * @readonly 
     */
    this.stopStamp = this.createStepStamp(0,0,0);
	
	/**
	 * Event handlers for scheduling events.    
	 * @type {ScheduleEventHandler} 
	 * // Create web audio context
	 * var audioCtx = new AudioContext();
	 * 
	 * // Create a pattern scheduler instance
	 * 
	 * @example <caption>Handling onQueue events</caption>
	 * // Create web audio context
	 * var audioCtx = new AudioContext();
	 * 
	 * // Create a pattern scheduler instance
	 * var scheduler = new Scheduler(audioCtx, {onQueue: queueStep}); 
	 *
	 * // Start playback 
	 * scheduler.start();
	 *
	 * // onQueue event handler
	 * function queueStep(timeStamp, stepStamp) {
	 *
	 *     var oscillator = audioCtx.createOscillator();
	 *     oscillator.connect(audioCtx.destination);
	 *
	 *     // Queue osillator to start playback on step's playback time
	 *     oscillator.start(timeStamp.swing);
	 *
	 *     oscillator.frequency.value = 800;
	 *
	 *     // Queue oscillator to stop playback 50ms after step's playback time
	 *     oscillator.stop(timeStamp.swing + 0.05); 
	 * }
	 * @example <caption>Handling onAnim events</caption>
	 * // Set the MCAD library debug level to 1 to see the step animation logs
	 * MCAD_LIBRARY = 1;
	 * 
	 * // Create web audio context
	 * var audioCtx = new AudioContext();
	 * 
	 * // Create a pattern scheduler instance
	 * var scheduler = new Scheduler(audioCtx, {onAnim: animateStep}); 
	 *
	 * // Start playback 
	 * scheduler.start();
	 * 
	 * // onAnim event handler
	 * function animateStep(currentStepStamp, lastStepStamp) {
	 *
	 *     console.log("Bar: " + currentStepStamp.bar + " Beat: " + currentStepStamp.beat + " Step: " + currentStepStamp.step);
	 *     console.log("patternPos: " + currentStepStamp.patternPos + " GUID: " + currentStepStamp.guid);
	 * }
	 * @example <caption>Handling onTween events</caption>
	 * // Set the MCAD library debug level to 1 to see the step animation logs
	 * MCAD_LIBRARY = 1;
	 * 
	 * // Create web audio context
	 * var audioCtx = new AudioContext();
	 * 
	 * // Create a pattern scheduler instance
	 * var scheduler = new Scheduler(audioCtx, {onTween: tweenPattern}); 
	 * 
	 * // Start playback 
	 * scheduler.start();
	 *
	 * // onTween event handler
	 * function tweenPattern(tween) {
	 *
	 *     // Only update the tween position if the sequence is playing back
	 *     if(scheduler.isPlaying) {
	 *         console.log("Tween Pos: " +  Math.trunc(tween * 100) + "%");
	 *     }
	 * }
	 */
	this.event = {};
    
    /** 
     * Time window (in seconds) that scheduler will look ahead to queue steps.
     * @type {!number}
     * @default 0.02
     */
    this.scheduleAheadTime = 0.02;

    /** 
     * This should be shorter than scheduleAheadTime so that the overlap between schedule events allows for some wiggle
     * room should the shedule event be delayed by other browser activities.
     * @Summary Time (in seconds) the scheduler will be queued for next schedule event.
     * @type {!number}
     * @default 0.01
     */
    this.lookAheadTime = 0.01;
    
    if(typeof options !== 'undefined') {
        
        if(options.lookAheadTime) this.lookAheadTime = options.lookAheadTime;
        if(options.scheduleAheadTime) this.scheduleAheadTime = options.scheduleAheadTime;
        if(options.maxSwing) this.maxSwing = options.maxSwing;
        if(options.beatsPerPattern) this.beatsPerPattern = options.beatsPerPattern;
        if(options.stepsPerBeat) this.stepsPerBeat = options.stepsPerBeat;
        if(options.tempo) this.tempo = options.tempo;
        
        this.event = {onQueue: options.onQueue, onAnim: options.onAnim, onTween: options.onTween};
    }
    
    // Web Audio context
    this._context = context;

    // ID of schedule timer event (so we can stop it at a later date)
    this._scheduleId = null;
    
    // ID of animation timer event (so we can stop it at a later date)
    this._animId = null;
	
	// Position (between 0 and 1 inclusive) the current playback position is within the bar
	this._tween = 0.0;
    
    // Current pattern step normalized queue time (so first step on playback is time=0)
    this._stepTime = 0.0;
    
    // Time the playback started
    this._startTime = null;
    
    // Index of current step queued in pattern (for 8 steps will be {@linkcode [0,7]}, i.e. 0 to 7 range)
    this._currentStamp = this.createStepStamp(0,0,0);
    
    // Pattern steps that have been queued up for playback (used by animate function to update animation)
    this._stepsInAnimationQueue = [];

    // Pattern step index of last step animated by animate function
    this._lastStepAnimated = {time: this.createTimeStamp(0,0), stamp: this.createStepStamp(0,0,-1)};    
    
    //-------------------------------------------------------------------------------------------------------------------------------------
    console.info("@@0@@Scheduler.Scheduler@@Tempo: " + this.tempo + ", Steps Per Beat: " + this.stepsPerBeat + ", Beats Per Pattern: " + this.beatsPerPattern + "");
    console.info("@@0@@Scheduler.Scheduler@@onQUeue: " + this.event.onQueue + ", onAmim: " + this.event.onAnim + ", onTween: " + this.event.onTween);
    //-------------------------------------------------------------------------------------------------------------------------------------
}

/*
Schedule Method
---------------

Responsible for looking into the future to see if any pattern steps fall within the schedule window (currentTime + sheduleAheadTime). If any are, queue them up to
be played and push the time and rhythm index of each step onto the animation queue. The next shedule event is queued up in lookAheadTime milliseconds, which will be
less than scheduleAheadTime. This allows for schedule events to overlap to accomodate jitter that can cause the schedule event to fire later than intended. If there
was no overlap, a schedule event may miss steps due to being delayed by other processes (garbage collection, ajax requests, browser activity, etc.).
*/
Scheduler.prototype._schedule = function() {

    var currentTime = this._context.currentTime;

    // Normalize currentTime to [0,n] range (i.e. beginning would be = 0, not actual time)
    currentTime -= this._startTime;
    
    // Loop round and que up steps while the current step being checked is within the schedule's look ahead window
    while (this._stepTime < currentTime + this.scheduleAheadTime) {
        
        // Time the step would be queued for playback without swing (needed for calculating tween values)
        var stepPlayTimeStraight = this._stepTime + this._startTime;
        
        // Time the step will be queued for playback (inc. swing)
        var stepPlayTimeSwing = stepPlayTimeStraight;
        
        // Length of step (in seconds, no swing)
        var stepLength = this.getStepLength();
        
        // Amount of swing to apply to this queued step (in seconds)
        var swing = this.swing * this.maxSwing * stepLength;
        
        // Only even steps get swing
        if(this._currentStamp.step % 2) stepPlayTimeSwing += swing;
        
        // Time stamp for this step (straight and swing)
        var timeStamp = this.createTimeStamp(stepPlayTimeStraight, stepPlayTimeSwing);
        
        // Push the step on the animation queue. Each element has a time and position stamp so that we can deduce which steps to animate in the animate function
        this._stepsInAnimationQueue.push({time: this.cloneTimeStamp(timeStamp), stamp: this.cloneStepStamp(this._currentStamp)});
        
        // Pass on the time and position stamps of this step to the user's event handler for queueing up the sound for playback
        if(this.event.onQueue) this.event.onQueue(this.cloneTimeStamp(timeStamp), this.cloneStepStamp(this._currentStamp));
        
        //-------------------------------------------------------------------------------------------------------------------------------------
        console.info("@@2@@Scheduler._schedule@@Step " + this._currentStamp.step + " queued for playback " + this._stepTime + " plus " + swing + " seconds from start time");
        //-------------------------------------------------------------------------------------------------------------------------------------

        // Advance the pattern sequence along by one step
        this._advanceStep();
    }
    
    // Queue another call to schedule function
    var that = this;
    this._scheduleId = setTimeout(function() { that._schedule(); }, this.lookAheadTime * 1000);
};
    
/*
Advance Step Method
-------------------

Responsible for moving the step position stamp along by one step after a step has been queued for playback. stepTime defines the time that the next pattern step should be queued
for playback and is incremented by one step's worth of time.
*/    
Scheduler.prototype._advanceStep = function() {
    
    // Duration (in seconds) that a beat at this tempo lasts
    var secondsPerBeat = 60.0 / this.tempo;

    // Move the sequence along to the pattern's next step
    this._currentStamp.step++;
    
    // clampStepStamp will handle wrapping of the stamp to the next bar if step reaches the end of the pattern
    this.clampStepStamp(this._currentStamp);
    
    // Advance the step time along by one step's worth of time (in seconds)
    this._stepTime += (1 / this.stepsPerBeat) * secondsPerBeat;
};

/*
Animate Method
--------------

Responsible for animating the visual representation of the pattern steps in sync with the pattern playback. The reason we don't animate the steps in the scheduling function
is because with long enough scheduleAheadTime windows and/or fast enough tempos, we may end up queueing up more than 1 step for playback when the pattern first starts. This 
would cause the animation to jump forwards a few steps when playback is initiated. Instead, the requestAnimationFrame is a seperate timer event where the browser chooses the
frequency of timing, usually synced to the moniter refresh. The browser can also put the requestAnimationFrame to sleep if the tab/browser isn't currently the focus to conserve
CPU/GPU resources.

To animate the correct step, we look in the step animation queue and find the most recent step in the past (by comparing it to the current time) to animate (we're not interested
in animating older steps that aren't in sync with playback). Once we've found the most up to date step, we check to see if it's different from the last animated step (no point
in animating the same step multiple times). If it is different, we call the user's animation event handler so that they can animate the steps in any way they see fit. Once we've
finished our current animation frame, we queue up another animation frame with a call to requestAnimationFrame.
*/
Scheduler.prototype._animate = function(){

    // We may not have a new step to animate so initialize current step to last step. If there isn't a new step to animate (because we haven't advanced to the next step yet),
    // we won't bother animating the current step again.
    var currentStep = this._lastStepAnimated;
    var currentTime = this._context.currentTime;

    // Find the most up to date step in queue (if any) for animating
    while (this._stepsInAnimationQueue.length && this._stepsInAnimationQueue[0].time.swing < currentTime) {
        
        // Is this the most up to date step? Could be, so set our current animation step to this one
        currentStep = this._stepsInAnimationQueue[0];
        
        // Remove this step from the queue (it's either up to date or old, in any case we won't need it after this animate call)
        this._stepsInAnimationQueue.splice(0,1);  
    }

    // Perform the tween calculation and send the result to the tween event handler
    this._tweenAnimate(currentTime);

    // We only animate a step if it's not the same as the last step (otherwise we'd be wasting time animating the same step over and over)
    if (this._lastStepAnimated.stamp.step != currentStep.stamp.step) {
    
        // The resume position stamp is where we will continue playback if the sequence is started again and resumePlayback is set to true. As the current animation step 
        // represents the current playback position, we increment the resume stamp by one step so that playback continues after the last step we played.
        this.resumeStamp = this.cloneStepStamp(currentStep.stamp);
        this.offsetStepStamp(this.resumeStamp, 1);
    
        // Send the animation data for this step to the animation event handler
        if(this.event.onAnim) this.event.onAnim(this.cloneStepStamp(currentStep.stamp), this.cloneStepStamp(this._lastStepAnimated.stamp));
    
        // Set the current step to the last step so the next call can check whetehr or not it's animating a new step
        this._lastStepAnimated = currentStep;
        
        //-------------------------------------------------------------------------------------------------------------------------------------
        console.info("@@1@@Scheduler._animate@@Step " + currentStep.stamp.step + " animated");
        //-------------------------------------------------------------------------------------------------------------------------------------
        
    }
    
    // Set up another animation frame request (the browser handles the sheduling time of animation frames for us)
    var that = this;
    this._animId = requestAnimationFrame(function() { that._animate(); });
};

/*
Tween Method
------------

Responsible for outputting a smooth, continues playback position (within the current bar/pattern) in the [0,1] range for smooth animations (e.g. playback head). Unlike the 
animation method, this method will continuously output a tween value, even when playback is stopped. 

If playback has stopped but resumePlayback is set to true, the pause position (step before resumeStamp) will be used as the tween value. Otherwise, if playback has stopped then
the start position (beginning of pattern) will be used.

*/

Scheduler.prototype._tweenAnimate = function(currentTime) {

    // Only calculate tween if this isn't the first step upon playback (-1 stepIndex causes miscalulation)
    if(this._lastStepAnimated.stamp.step >= 0 && this.isPlaying) {
    
        // Tween calculation is as follows:
        // 1. Calculate where the current playback position between the current animated step and current (last) step (0 = beginning, 1 = end)
        // 2. Calculate the step position within pattern of playback position (e.g. 7.5 = half way through the 8th step)
        // 3. Divide this by the total number of steps in the pattern to get a tween value in the [0,1] range
        // 
        // Note: the time without swing is used rather than the swing time. This is because the swing time causes problems when calculating the 
        // tween value as the start and end times of steps are irregular (due to the late starts of swung steps)
        
        // 1. 
        var stepLength = this.getStepLength();                              // Length of step (in seconds)
        var stepTween = currentTime - this._lastStepAnimated.time.straight; // Time position of playback in current step (0 = beginning, stepLength = end)
        var t = stepTween / stepLength;                                     // Normalized position of current playback in current step (0 = beginning, 1 = end)
        
        // 2. 
        var stepPos = this._lastStepAnimated.stamp.patternPos + t;          // Step position of playback in pattern (e.g. 7.5 = halfway through 8th step)
        var stepsPerPattern = this.getStepsPerPattern();                    // Number of steps in a pattern
        
        // 3. 
        this._tween = stepPos / stepsPerPattern;                            // Tween value of playback position in pattern (0 = beginning, 1 = end of pattern)
    }
	
    if(this.event.onTween) this.event.onTween(this._tween);
};

/** 
 * Returns the number of steps per pattern.
 * @returns {number} The number of steps per pattern.
 * @example 
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create an 8/4 pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120, stepsPerBeat: 4, beatsPerPattern: 8});
 * 
 * // Log the number of steps per pattern (stepsPerBeat * beatsPerPattern)
 * console.log(scheduler.getStepsPerPattern());
 */
Scheduler.prototype.getStepsPerPattern = function() {
    
    return (this.stepsPerBeat * this.beatsPerPattern);
};

/** 
 * Starts playback of sequence.
 * @param {StepStamp} [startStamp] - the step position stamp to resume playback (otherwise, will be beginning of pattern or resumeStamp).
 * @example <caption>Start the sequence playback from the beginning</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Start playback
 * someScheduler.start();
 * @example <caption>Start the sequence playback from supplied step position stamp</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Create a step position stamp 8 bars from the start
 * var startFromStamp = scheduler.createStepStamp(8,0,0); 
 * 
 * // Start playback at the specified step position stamp
 * someScheduler.start(startFromStamp);
 */
Scheduler.prototype.start = function(startStamp) { 

    //-------------------------------------------------------------------------------------------------------------------------------------
    console.info("@@0@@Scheduler.start@@Playback started at " + (new Date()));
    //-------------------------------------------------------------------------------------------------------------------------------------

    // If the pattern is currently playing back, stop playback before resetting playback
    if(this.isPlaying === true) this.Stop();
    
    // Set the flag to signfy that playback has started
    this.isPlaying = true;
    
    // Reset book keeping variables
    this._stepTime = 0.0;
    this._startTime = this._context.currentTime;
    
    // If user has supplied a position stamp, use that as the start position. Otherwise, use resumePlayback or start at the beginning of the pattern (depending on whether or not
    // the resumePlayback flag has been set to true).
    if(startStamp) this._currentStamp = this.cloneStepStamp(this.startStamp);
    else if(this.resumePlayback) this._currentStamp = this.cloneStepStamp(this.resumeStamp);
    else this._currentStamp = this.createStepStamp(0,0,0);
    
    // The last step animated is set to the null step (position -1) to signify that the step animation has been restarted
    this._lastStepAnimated = {time: this.createTimeStamp(this._context.currentTime,this._context.currentTime), stamp: this.createStepStamp(0,0,-1)};

    // Kickstart the scheduler timer loops
    this._schedule();
    this._animate();
};

/** 
 * Stops playback of sequence.
 * @example
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Stop sequence playback
 * someScheduler.stop();
 */
Scheduler.prototype.stop = function() {

    //-------------------------------------------------------------------------------------------------------------------------------------
    console.info("@@0@@Scheduler.stop@@Playback stopped at " + (new Date()));
    //-------------------------------------------------------------------------------------------------------------------------------------
            
    // Set the flag to signfy that playback has stopped
    this.isPlaying = false;

    // Stop the scheduler timers
    clearTimeout(this._scheduleId);
	cancelAnimationFrame(this._animId);
	
	// Reset tween value if not pausing
	if(this.event.onTween && !this.resumePlayback) {
		this._tween = 0.0; 
		this.event.onTween(this._tween);
	}
    
    // Stop stamp is step position playback was stopped on, resume position is next step after stop position
    this.stopStamp = this.cloneStepStamp(this._lastStepAnimated.stamp);
    this.resumeStamp = this.cloneStepStamp(this.stopStamp);
    this.offsetStepStamp(this.resumeStamp, 1);
};

/** 
 * Calculates the length (in seconds) of a straight step.
 * @returns {number} The step duration (in seconds).
 * @example 
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Log the duration (in seconds) of a straight step on the pattern
 * console.log(scheduler.getStepLength());
 */
Scheduler.prototype.getStepLength = function() { 

    return (60 / this.tempo) * (1 / this.stepsPerBeat);
};

/** 
 * Clones a step position stamp
 * @param {StepStamp} stamp - the step position stamp to be cloned.
 * @returns {StepStamp}       The cloned copy of the supplied step position stamp.
 * @example 
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Create a step position stamp 8 bars from the start
 * var stepStamp = scheduler.createStepStamp(8,0,0); 
 * 
 * var myStepStamp = someScheduler.cloneStepStamp(stepStamp);
 */
Scheduler.prototype.cloneStepStamp = function(stamp) {

    var result = {bar: stamp.bar, beat: stamp.beat, step: stamp.step, patternPos: stamp.patternPos, guid: stamp.guid};
    
    return result;
};

/** 
 * Creates a step position stamp from bar, beat and step positions.
 * @param {number} bar  - the bar position of this stamp.
 * @param {number} beat - the beat position of this stamp.
 * @param {number} step - the step position of this stamp.
 * @returns {StepStamp}   The newly created step position stamp.
 * @example
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Create a step position stamp at 3rd bar, 2nd beat, 4th step
 * var myStepStamp = scheduler.createStepStamp(2, 1, 3);
 */
Scheduler.prototype.createStepStamp = function(bar, beat, step) {

    var result = {bar: bar, beat: beat, step: step};
    
    this.clampStepStamp(result);
    
    return result;
};

/** 
 * Wraps and clamps a step position stamp into valid ranges.
 * @param {StepStamp} stamp - the step position stamp to wrap and clamp.
 * @returns {StepStamp}       The clamped step position stamp.
 * @example
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Assuming an 8 step pattern:
 * // bar: 2, beat: 1, step: 10 // Invalid! Wrap the stamp round to a valid range
 * // Becomes: 
 * // bar: 3, beat: 0, step: 2
 * scheduler.clampTimeStamp(myStepStamp);
 */
Scheduler.prototype.clampStepStamp = function(stamp) {

    var totalSteps = stamp.step + (stamp.bar * this.getStepsPerPattern()) + (stamp.beat * this.stepsPerBeat);
    
    // Negative total steps means this is a null step (pattern position is -1)
    if(totalSteps < 0) stamp = {step: -1, bar: 0, beat: 0, patternPos: 0, guid: -1};
    else {
    
        stamp.bar = Math.floor(totalSteps / this.getStepsPerPattern());
        
        totalSteps -= stamp.bar * this.getStepsPerPattern();
        
        stamp.beat = Math.floor(totalSteps / this.stepsPerBeat);
        
        totalSteps -= Math.floor(stamp.beat * this.stepsPerBeat);
        
        stamp.step = totalSteps;
        
        stamp.patternPos = (stamp.beat * this.stepsPerBeat) + stamp.step;
        
        stamp.guid = (stamp.bar * this.getStepsPerPattern())  + stamp.patternPos;
    }
};

/** 
 * Offsets a step position stamp by a positive or negative number of steps.
 * @param {StepStamp} stamp - the step position stamp to offset.
 * @param {StepStamp}       - the number of steps forwards or backwards to offset.
 * @example <caption>Offset a step position stamp by 12 steps backwards</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * scheduler.offsetStepStamp(myStepStamp, -12);
 * @example <caption>Offset a step position stamp by 3 steps forwards</caption>
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * scheduler.offsetStepStamp(myStepStamp, 3);
 */
Scheduler.prototype.offsetStepStamp = function(stamp, steps) {

    stamp.step += steps;
    
    this.clampStepStamp(stamp);
};

/** 
 * Clones a time position stamp
 * @param {TimeStamp} stamp - the time position stamp to be cloned.
 * @returns {TimeStamp}       The cloned copy of the supplied time position stamp.
 * @example 
 * var myTimeStamp = someScheduler.cloneTimeStamp(someTimeStamp);
 */
Scheduler.prototype.cloneTimeStamp = function(stamp) {

    var result = {straight: stamp.straight, swing: stamp.swing};
    
    return result;
};

/** 
 * Creates a time position stamp from straight and swung timing values.
 * @param {number} straight  - the straight step time of this stamp.
 * @param {number} swung     - the swung step time of this stamp.
 * @returns {TimeStamp}        The newly created time position stamp.
 * @example 
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Create a time position stamp with 0.5s and 0.75s straight and swung timing values
 * var myTimeStamp = scheduler.createTimeStamp(0.5, 0.75);
 */
Scheduler.prototype.createTimeStamp = function(straight, swing) {

    var result = {straight: straight, swing: swing};
    
    return result;
};

/** 
 * Takes an absolute context time value (e.g. the context's {@linkcode currentTime} property) and quantizes it to the nearest step stamp value equal to or before the time value.
 * @param {number} time - the absolute context time value.
 * @returns {TimeStamp}   The nearest step stamp value equal to or before {@linkcode time}.
 * @example 
 * // Create web audio context
 * var audioCtx = new AudioContext();
 * 
 * // Create a pattern scheduler instance
 * var scheduler = new Scheduler(audioCtx, {tempo: 120});
 * 
 * // Start scheduler playback
 * scheduler.start();
 *
 * // Set a timer to fire in one second's time
 * setInterval(myMethod, 1000);
 *
 * // Output the nearest step stamp value one second into the scheduler's playback
 * function myMethod() {
 *    console.log(scheduler.quantize(audioCtx.currentTime));
 * }
 */
Scheduler.prototype.quantize = function(time) {

    if(!this.isPlaying) return {step: -1, bar: 0, beat: 0, patternPos: 0, guid: -1};
		
	var currentTime = time - this._startTime;
	
	var step = Math.floor(currentTime / this.getStepLength());
	
	return this.createStepStamp(0, 0, step);
};