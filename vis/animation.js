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
    progress_time(ts){
        let time_delta = ts - this.start_time;
        let prog_percent = time_delta / this.total_duration;
		let stage = 0;
		let stage_percentage = 0;
        for(let i = 0; i < this.stages.length; i ++){
            time_delta -= this.stages[i].duration;
            if(time_delta < 0){
				stage = i;
				stage_percentage = 1 - ((time_delta*-1) / this.stages[i].duration);
				break;
			} 
        }
        return [stage, prog_percent, stage_percentage, ts - this.start_time];
	}
	progress_percent(p){
		let prog_percent = p;
		let ts = prog_percent * this.total_duration + this.start_time;
		return this.progress_time(ts);
	}
	addStage(stage){
        this.stages.push(stage);
        this.total_duration += stage.duration;
	}
	startStage(stageIndex){
		if(stageIndex >= this.stages.length) {
			return false;
		}
		for(let s = 0; s < stageIndex; s++){
			let pre_stage = this.stages[s];
			let endings = pre_stage.getEndings();
			vis.initStageInitials(endings);
		}
		for(let e = this.stages.length - 1; e >= stageIndex; e--){
			let post_stage = this.stages[e];
			let startings = post_stage.getStartings();
			vis.initStageInitials(startings);
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
		vis.animationDone();
	}
	percentUpdate(p){
		let [current_stage, anim_percentage, stage_percentage, time_from_start] = this.progress_percent(p);
		if(anim_percentage >= 1){
			this.finish();
			return [this.stages.length - 1, 1];
		}
		return [current_stage, stage_percentage];
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
		if(element == undefined){
			console.log('no element!');
		}
		this.transitions.push({element:element, attr:attr, attrFrom:attrFrom, changeTo:changeTo, start:start, end:end});
		this.elements.push(element);
	}
	loadStage(){
        let interpolators = [];
		for(var t in this.transitions){
            let transition = this.transitions[t];
            let partial_interpolator = d3.interpolate(transition.attrFrom, transition.changeTo);
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
	getEndings(){
		let endings = [];
		for(var t in this.transitions){
            let transition = this.transitions[t];
            let partial_interpolator = d3.interpolate(transition.attrFrom, transition.changeTo);
			endings.push({el: transition.element, attr: transition.attr, value: partial_interpolator(1)});
		}
		return endings;
	}
	getStartings(){
		let startings = [];
		for(var t in this.transitions){
            let transition = this.transitions[t];
            let partial_interpolator = d3.interpolate(transition.attrFrom, transition.changeTo);
			startings.push({el: transition.element, attr: transition.attr, value: partial_interpolator(0)});
		}
		return startings;
	}
	setFunc(f){
		this.functions.push(f);
	}

}