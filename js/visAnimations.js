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

// return a function that takes in all dynamic elements (sample points, distribution etc) and returns and animation.
function getAnimation(module, dimensions, statisticsDimensions, repititions, includeDistribution, speedMultiplier){
	return function(d){
		if(!speedMultiplier) speedMultiplier = 1;
		var animation = new visAnim('animation');
		var inclueSelectedPoints = module.name == "Sampling Variation";
		var inclueSelectedPoints = dimensions[0].type != 1;
		var secondStageMultiSize = dimensions.length > 1 ? 0 : dimensions[1].categories.length;
		if(inclueSelectedPoints){
			animation.addStage(samplePointsFadeInStage(d, animation, speedMultiplier, "fadeSelectedPoints"));
			animation.addStage(samplePointsDropFromPop(d, animation, speedMultiplier, "pointsDrop", secondStageMultiSize == 0));
		}
		var hasExtraStatMark = dimensions.length >= 2 && dimensions[1].categories.length > 2;
		if(secondStageMultiSize > 1){
			animation.addStage(samplePointsSplitToGroups(d, animation, speedMultiplier, "samplePointsSplitToGroups"));
		}
		animation.addStage(statMarkersFadeInStage(d, animation, speedMultiplier, "statMarkersFade", hasExtraStatMark));
		if(includeDistribution){
			var distDropStage;
			if(dimensions.length < 2 || dimensions[1].categories.length < 2){
				distDropStage = singleNumericalDistDrop;
			}else if(dimensions[1].categories.length == 2){
				distDropStage = diffDistDrop;
			}else{
				distDropStage = multiDiffDistDrop;
			}
			animation.addStage(distDropStage(d, animation, speedMultiplier, "distDropStage"));
			animation.addStage(distElementsFadeInStage(d, animation, speedMultiplier, "distElementsFade"));
		}
		return animation;
	};
}

// ***********************Stage Constructors************************8
function samplePointsFadeInStage(d, animation, speedMultiplier, name){
	var stage = new animStage(name, animation.name, 2000 * speedMultiplier);
	var count = 0;
	var totalNumPoints = state.sampleSize;
	var fadeTimeEachPoint = 0.9/totalNumPoints;
	
	selectAllSamplePoints(d, function(element, sampleCategory, categoryIndex){
		var startPos = vis.allPopElements[element.popId].centerY;
		stage.setTransition(element, 'centerY', startPos, startPos, 0, 1);
		stage.setTransition(element, 'color', "#000000", "#FF0000", fadeTimeEachPoint * count, fadeTimeEachPoint * (count+1));
		count++;
	});
	selectAllStatMarkers(d, function(element, index){
		stage.setTransition(element, 'opacity', 0, 0, 0,1);
	});
	stage.setTransition(d.selectedDistElements[0], 'opacity', 0, 0, 0,1);

	if(d.selectedDistStatMarker) stage.setTransition(d.selectedDistStatMarker, 'opacity', 0, 0, 0, 1);
	return stage;
}

function samplePointsDropFromPop(d, animation, speedMultiplier, name, toStacked){
	var stage = new animStage(name, animation.name, 2000 * speedMultiplier);
	var midPoint = (vis.dynamicSections.s2.elements[1].bbHeight/2) + vis.dynamicSections.s2.elements[1].boundingBox[1];
	selectAllSamplePoints(d, function(element, sampleCategory, categoryIndex){
		var endPos = toStacked ? element.centerY : midPoint;
		var startPos = vis.allPopElements[element.popId].centerY;
		stage.setTransition(element, 'centerY', startPos, endPos, 0, 1);
		if(toStacked) stage.setTransition(element, 'color', null, "#FF0000", 0, 1);
	});
	return stage;
}
function samplePointsSplitToGroups(d, animation, speedMultiplier, name){
	var stage = new animStage(name, animation.name, 2000 * speedMultiplier);
	var midPoint = (vis.dynamicSections.s2.elements[1].bbHeight/2) + vis.dynamicSections.s2.elements[1].boundingBox[1];
	selectAllSamplePoints(d, function(element, sampleCategory, categoryIndex){
		var endPos = element.centerY;
		stage.setTransition(element, 'centerY', midPoint, endPos, 0.5, 1);
	});
	return stage;
}
function statMarkersFadeInStage(d, animation, speedMultiplier, name, except){
	var stage = new animStage(name, animation.name, 2000 * speedMultiplier);
	var count = 0;
	var totalNumPoints = state.sampleSize;
	var fadeTimeEachPoint = 1/totalNumPoints;
	selectAllSamplePoints(d, function(element, sampleCategory, categoryIndex){
		stage.setTransition(element, 'color', "#FF0000", "#000000", 0, 1);
		count++;
	});
	selectAllStatMarkers(d, function(element, index){
		if(except && index == d.sample.statMarkers.length-1) return;
		stage.setTransition(element, 'color', "#000000", "#000000", 0, 1);
		stage.setTransition(element, 'opacity', 0, 1, 0, 1);

	});
	if(d.selectedDistStatMarker) stage.setTransition(d.selectedDistStatMarker, 'opacity', 0, 1, 0, 1);
	return stage;
}
function singleNumericalDistDrop(d, animation, speedMultiplier, name){
	var stage = new animStage(name, animation.name, 2000 * speedMultiplier);
	var statMark = d.sample.statMarkers[0];
	stage.setTransition(statMark, 'color', "#000000", "#FF0000", 0, 0.25);
	var start = statMark.alternateBB[0];
	var end = d.selectedDistElements[0];
	stage.setTransition(statMark, 'boundingBox', start, [end.centerX, end.centerY, end.centerX, end.centerY], 0, 1);
	stage.setTransition(statMark, 'opacity', 1, 0, 0.5, 1);
	return stage;
}
function diffDistDrop(d, animation, speedMultiplier, name){
	var stage = new animStage(name, animation.name, 2000 * speedMultiplier);
	var statMark = d.sample.statMarkers[2];
	stage.setTransition(statMark, 'color', "#000000", "#FF0000", 0, 0.1);
	var start = statMark.alternateBB[0];
	var end = d.selectedDistElements[0];
	stage.setTransition(statMark, 'boundingBox', start, [vis.distScale(0), end.centerY, end.centerX, end.centerY], 0, 1);
	return stage;
}
function multiDiffDistDrop(d, animation, speedMultiplier, name){
	var stage = new animStage(name, animation.name, 4000 * speedMultiplier);
	var statMarks = d.sample.statMarkers.filter(function(e){return e.type == "arrow"});
	var count = 0;
	var distSection = vis.dynamicSections.s3.elements[1];
	var distSectionBB = distSection.boundingBox;
	var arrowsHeight = distSection.bbHeight/3;
	var end = [distSectionBB[0] + distSection.bbWidth/2, distSectionBB[1],distSectionBB[0] + distSection.bbWidth/2, distSection[1] + arrowsHeight];
	var arrowHeightDiff = (arrowsHeight) / statMarks.length;
	for(var s in statMarks.slice(0,statMarks.length-1)){
		var statMark = statMarks[s];
		stage.setTransition(statMark, 'color', "#000000", "#FF0000", 0, 0.1);
		var start = statMark.alternateBB[0];

		stage.setTransition(statMark, 'boundingBox', start, [end[0]-statMark.bbWidth/2, end[1]+arrowHeightDiff*count, end[2]+statMark.bbWidth/2, end[1]+arrowHeightDiff*count], 0, 0.3);
		//stage.setTransition(statMark, 'opacity', 1, 0, 0.5, 1);
		stage.setTransition(statMark, 'color', "#FF0000", "#000000", 0.5, 0.6);
		count++;
	}

	var statMark = statMarks[count];
	stage.setTransition(statMark, 'color', "#000000", "#FF0000", 0, 0.1);
	stage.setTransition(statMark, 'opacity', 1, 0, 0, 0.1);
	var start = statMark.alternateBB[0];
	//stage.setTransition(statMark, 'boundingBox', start, [end[0]-statMark.bbWidth/2, end[1]+arrowHeightDiff*count, end[2]+statMark.bbWidth/2, end[1]+arrowHeightDiff*count], 0, 0.1);
	//stage.setTransition(statMark, 'opacity', 1, 0, 0.5, 1);
	stage.setTransition(statMark, 'color', "#000000", "#FF0000", 0.5, 0.6);
	stage.setTransition(statMark, 'opacity', 0, 1, 0.5, 0.6);
	var start = statMark.alternateBB[0];
	var end = d.selectedDistElements[0];
	stage.setTransition(statMark, 'boundingBox', start, [vis.distScale(0), end.centerY, end.centerX, end.centerY], 0.6, 1);
	return stage;
}
function distElementsFadeInStage(d, animation, speedMultiplier, name){
	var stage = new animStage(name, animation.name, 2000 * speedMultiplier);
	var count = 0;
	var totalNumPoints = state.sampleSize;
	var fadeTimeEachPoint = 1/totalNumPoints;
	
	for(var dist in d.selectedDistElements){
		stage.setTransition(d.selectedDistElements[dist], 'opacity', 0, 1, 0,1);
	}
	return stage;
}
// Animation Constructors
// take in dynamic elements and return the animation.
function SquareTest(dynamicElements){
	return createSquareAnim(dynamicElements.test);
}

function selectAllSamplePoints(dynamicElements, func){
	for(var sc in dynamicElements.sample.datapoints){
		for (var i in dynamicElements.sample.datapoints[sc]){
			func(dynamicElements.sample.datapoints[sc][i], sc, i);
		}
	}
}
function selectAllStatMarkers(dynamicElements, func){
	for(var sc in dynamicElements.sample.statMarkers){
		func(dynamicElements.sample.statMarkers[sc], sc,);
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
		dropToCenter.setTransition(element, 'color', null, '#FF0000', 0, 1);
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