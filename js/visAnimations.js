class visAnim {
	constructor(name){
		this.name = name;
		this.stages = [];
		this.currentStage = null;
		this.playing = false;
		this.currentStageProgress = 0;
		this.done = false;
	}
	addStage(stage){
		this.stages.push(stage);
	}
	startStage(stageIndex){
		if(stageIndex >= this.stages.length) {
			return false;
		}
		this.currentStage = stageIndex;
		this.stages[stageIndex].loadStage();
		this.playing = true;
		this.done = false;
		return true;
	}
	nextStage(){
		if(this.currentStage != null){
			this.currentStage++;
		}else{
			this.currentStage = 0;
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
	}
	setTransition(element, attr, attrFrom, changeTo, start, end){
		this.transitions.push({element:element, attr:attr, attrFrom:attrFrom, changeTo:changeTo, start:start, end:end});
		this.elements.push(element);
	}
	loadStage(){
		for(var el in this.elements){
			this.elements[el].resetStage(this.animName, this.name, this.duration);
		}
		for(var t in this.transitions){
			var transition = this.transitions[t];
			transition.element.loadTransition(this.name, this.animName, transition.attr, transition.attrFrom, transition.changeTo, transition.start, transition.end, this.duration);
		}
	}

}

function createSquareAnim(element){
	var moveSquare = new visAnim('moveSquare');
	var msStage1 = new animStage('s1', 'moveSquare', 2000);
	msStage1.setTransition(element, 'centerX', 500, 0, 1);
	msStage1.setTransition(element, 'centerY', 500, 0, 1);
	moveSquare.addStage(msStage1);

	var msStage2 = new animStage('s2', 'moveSquare', 2000);
	msStage2.setTransition(element, 'centerX', 600, 0, 1);
	msStage2.setTransition(element, 'centerY', 100, 0, 1);
	moveSquare.addStage(msStage2);
	return moveSquare;
}

// Animation Constructors
// take in dynamic elements and return the animation.
function SquareTest(dynamicElements){
	return createSquareAnim(dynamicElements.test);
}

function selectAllSamplePoints(dynamicElements, func){
	for(var sc in dynamicElements.sample.datapoints){
		for (var i in dynamicElements.sample.datapoints[sc]){
			func(dynamicElements.sample.datapoints[sc][i]);
		}
	}
}
function fallDown(dynamicElements, speedMulti){
	if(!speedMulti) speedMulti = 1;
	var fallDown = new visAnim('fallDown');
	// var msStage1 = new animStage('s1', 'fallDown', 50);
	// for(var sc in dynamicElements.sample.datapoints){
	// 	for (var i in dynamicElements.sample.datapoints[sc]){
	// 		var element = dynamicElements.sample.datapoints[sc][i];
	// 		msStage1.setTransition(element, 'centerY', 200, element.centerY, 0, 1);
	// 	}
	// }
	// fallDown.addStage(msStage1);
	var dropToCenter = new animStage('dropToCenter', 'fallDown', 2000 * speedMulti);
	var midPoint = (vis.dynamicSections.s2.elements[1].bbHeight/2) + vis.dynamicSections.s2.elements[1].boundingBox[1];
	selectAllSamplePoints(dynamicElements, function(element){
		var startPos = vis.allPopElements[element.popId].centerY;
		dropToCenter.setTransition(element, 'centerY', startPos, midPoint, 0, 1);
	});
	fallDown.addStage(dropToCenter);

	var centerPause = new animStage('dropToCenter', 'fallDown', 1000 * speedMulti);
	fallDown.addStage(centerPause);

	var splitToGroups = new animStage('s3', 'fallDown', 2000 * speedMulti);
	selectAllSamplePoints(dynamicElements, function(element){
		splitToGroups.setTransition(element, 'centerY', null, element.centerY, 0, 1);
	});
	fallDown.addStage(splitToGroups);
	return fallDown;
}