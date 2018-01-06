class Animation {
	constructor(name){
		this.name = name;
		this.stages = [];
		this.currentStage = null;
		this.playing = false;
        this.done = false;
        this.start_time = 0;
        this.total_duration = 0;
        this.total_progress = 0;
        this.stage_progress = 0;
    }
    start(){
        if(this.stages.length < 1) return "no stages";
        this.start_time = window.performance.now();
        this.playing = true;
        this.startStage(0);
    }
    progress(ts){
        let time_delta = ts - this.start_time;
        let prog_percent = time_delta / total_duration;
        let stage = 0;
        for(let i = 0; i < this.stages.length; i ++){
            time_delta -= this.stages[i].duration;
            if(time_delta < 0) break;
        }
        return [stage, prog_percent, ts - this.start_time];
    }
	addStage(stage){
        this.stages.push(stage);
        this.total_duration = 0;
	}
	startStage(stageIndex){
		if(stageIndex >= this.stages.length) {
			return false;
		}
		this.currentStage = stageIndex;
        let [elements, interpolators] = this.stages[stageIndex].loadStage();
        vis.initInterpolators(interpolators);
		this.playing = true;
		this.done = false;
		return true;
	}
	nextStage(change){
		change = change ? change : 1;
		if(this.currentStage != null){
			this.currentStage = parseInt(this.currentStage) + change;
		}else{
			this.currentStage = -1 + change;
		}
		return this.startStage(this.currentStage);
	}
	nextStageAvailiable(){
		var stage = this.currentStage;
		if(stage != null){
			stage++;
		}else{
			stage = 0;
		}
		return this.stages.length > stage && this.stages[stage];
	}
	getStageDuration(){
		if(this.currentStage == null) return null;
		return this.stages[this.currentStage].duration;
	}
	getStage(){
		if(this.currentStage == null) return null;
		return this.stages[this.currentStage];
	}
	finish(){
		//this.currentStage = null;
		this.playing = false;
		this.currentStageProgress = 0;
		this.done = true;
	}

}

// Each stage of the animation. progress is measured from 0-1.
class animStage {
	constructor(name, animName, duration){
		this.name = name;
		this.animName = animName;

		// length in miliseconds for stage.
		this.duration = duration;

		// The transitions that will occur during the stage.
		this.transitions = [];

		// The elements to update
		this.elements = [];

		// functions to call on load.
		this.functions = [];
	}
	setTransition(element, attr, attrFrom, changeTo, start, end){
		this.transitions.push({element:element, attr:attr, attrFrom:attrFrom, changeTo:changeTo, start:start, end:end});
		this.elements.push(element);
	}
	loadStage(){
        let interpolators = [];
		for(var t in this.transitions){
            let transition = this.transitions[t];
            let partial_interpolator = d3.interpolate(transition.attrFrom, changeTo);
            let interpolator = function(percentage){
                if(percentage <= transition.start) return partial_interpolator(0);
                if(percentage >= transition.end) return partial_interpolator(1);
                return partial_interpolator((percentage - transition.start)/(transition.end - transition.start));
            }
			interpolators.push({el: transition.element, attr: transition.attr, value: interpolator});
		}
		for(var f in this.functions){
			this.functions[f]();
        }
        return [this.elements, interpolators];
	}
	setFunc(f){
		this.functions.push(f);
	}

}