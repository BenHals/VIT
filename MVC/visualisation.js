/*jshint esversion: 6 */
class visualisation {
    constructor(){
        this.dynamicElements = {};
    }
    setup(population, module){
        this.canvas = document.getElementById('popCanvas');
        this.dynamicCanvas = document.getElementById('dynamicCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dynamicCtx = this.dynamicCanvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.oImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.dynamicCtx.imageSmoothingEnabled = false;
        this.dynamicCtx.mozImageSmoothingEnabled = false;
        this.dynamicCtx.oImageSmoothingEnabled = false;
        this.dynamicCtx.webkitImageSmoothingEnabled = false;
        this.population = population;
        this.dimensions = population.dimensions;
        this.sections = createSections($('#popCanvas'), this.ctx, 5, 10);
        this.dynamicSections = createSections($('#dynamicCanvas'), this.dynamicCtx, 5, 10);
        this.module = module;

        this.singleNumericalStatistics = ['Mean', 'Median'];
        this.singleCategoricalStatistics = ['Proportion'];
        this.dualNumericalStatistics = ['Diff'];
        this.dualCategoricalStatistics = ['Diff'];
        this.multiNumericalStatistics = ['AvgDeviation', 'FStat'];
        this.multiCategoricalStatistics = ['AvgDeviation', 'FStat'];

        this.animation = null;
        this.paused = false;
        this.pauseTime = 0;

    }
    sampleSizeMax(){
        return this.population ? this.population.allDataPoints.length : 0;
    }
    sampleSizeMin(){
        // either use the full range availiable, or only use the population size.
        return this.module.sampleSize == sampleSizeOptions.fullRange ? 1 : this.population.allDataPoints.length;
    }
    sampleSizeDefault(){
        return this.module.name != "Sampling Variation" ? this.sampleSizeMax() : Math.min(Math.ceil(this.population.allDataPoints.length / 2), 40);
    }
    getStatisticsOptions(){
        var type;
        // We must check for Randomisation Variation, as we add anouther dimension to the data.
        if(this.dimensions.length == 1 && this.module.name != "Randomisation Variation"){
            type = this.dimensions[0].type;
            return type == 0 ? this.singleNumericalStatistics : this.singleCategoricalStatistics;
        }else if(this.dimensions.length == 2 && this.dimensions[1].categories.length == 2 || (this.module.name == "Randomisation Variation" && this.module.sampleGroups.length <= 2)){
            type = this.dimensions[0].type;
            return type == 0 ? this.dualNumericalStatistics : this.dualCategoricalStatistics;
        }else{
            type = this.dimensions[0].type;
            return type == 0 ? this.multiNumericalStatistics : this.multiCategoricalStatistics;
        }
    }
    setupPopulationElements(){
        d3.select("#svgContainer").selectAll("*").remove();
        // We want heaped points for numerical values (type = 0)
        // and proportion bars for categorical values (type = 1)
        var popSectionDisplayArea = this.sections.s1.elements[1];
        var populationSections = setupSection(this.population, this.ctx, popSectionDisplayArea);
        var popScale = d3.scaleLinear();
        popScale.range([popSectionDisplayArea.boundingBox[0], popSectionDisplayArea.boundingBox[2]]);
        if(this.dimensions[0].type == 0){
            popScale.domain(this.population.statistics.overall.extent).nice();
            this.popElements = setupNumerical(this.population, this.ctx, popSectionDisplayArea, popScale, populationSections);
        }else if(this.dimensions[0].type == 1){
            popScale.domain([0,1]);
            this.popElements = setupProportional(this.population, this.ctx, popSectionDisplayArea, popScale, populationSections);
        }
        this.allPopElements = [];
        for(var c in this.popElements){
            this.allPopElements = this.allPopElements.concat(this.popElements[c]);
        }
        this.allPopElements.sort(function(a,b){return a.popId - b.popId;});
        var popSectionAxisArea = this.sections.s1.elements[2];
        setupPopAxis(popSectionAxisArea, popScale, this.ctx);
        var popLabelArea = this.sections.s1.elements[0];
        setupLabel(this.module.labels[0], popLabelArea, this.ctx);

        getStatisticsOptions();
        setupPopStatistic(this.population, popSectionDisplayArea, popSectionDisplayArea, popScale,  true,  this.ctx);

        // Save scale
        this.popScale = popScale;

    }
    setupSampleElements(){
        this.clearAll();
        d3.selectAll("#sampSectionAxis").remove();
        d3.selectAll("#sampLabel").remove();
        
        var sampleSectionAxisArea = this.sections.s2.elements[2];
        sampleSectionAxisArea.elements = [];
        setupPopAxis(sampleSectionAxisArea, this.popScale, this.ctx, 'samp');
        var sampleLabelArea = this.sections.s2.elements[0];
        sampleLabelArea.elements = [];
        setupLabel(this.module.labels[1], sampleLabelArea, this.ctx, 'samp');

        this.distScale = getDistributionScale();
        var distSectionAxisArea = this.sections.s3.elements[2];
        distSectionAxisArea.elements = [];
        setupPopAxis(distSectionAxisArea, this.distScale, this.ctx, 'samp');
        var distLabelArea = this.sections.s3.elements[0];
        distLabelArea.elements = [];
        setupLabel(this.module.labels[2], distLabelArea, this.ctx, 'samp');

        var distSectionDisplayArea = this.dynamicSections.s3.elements[1];
        distSectionDisplayArea.elements = [];
        this.dynamicElements.distribution = {container:distSectionDisplayArea};
        var distRet = setupDistribution(state.sampleData.distribution, this.dynamicCtx, distSectionDisplayArea, this.distScale, this.module);
        this.dynamicElements.distribution.datapoints = distRet[0];
        this.dynamicElements.distribution.CI = distRet[1];
            

        
        this.drawPop();
    }
    setupSample(sampleID, lastSID){
        this.clearSample();
        lastSID = lastSID ? lastSID : sampleID - 1;
        if(lastSID > sampleID) {
            lastSID = 0;
            sampleID = 1;
        }
        var sampleSectionDisplayArea = this.dynamicSections.s2.elements[1];
        var distElement = this.dynamicElements.distribution.datapoints.slice(lastSID + 1, sampleID+1);
        if(!distElement) distElement= this.dynamicElements.distribution.datapoints.slice(0, 2);
        this.dynamicElements.selectedDistElements = distElement;
        var sampleSections = setupSection(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea);
        this.dynamicElements.sample = {container: sampleSectionDisplayArea};
        if(state.sampleData.dimensions[0].type == 0){
            this.dynamicElements.sample.datapoints = 
                setupNumerical(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea, this.popScale, sampleSections);
        }else if(state.sampleData.dimensions[0].type == 1){
            this.dynamicElements.sample.datapoints = 
                setupProportional(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea, this.popScale, sampleSections);
        }
         var statMarkers = setupPopStatistic(state.sampleData.samples[sampleID], sampleSectionDisplayArea, this.dynamicSections.s3.elements[1], this.popScale, false,  this.dynamicCtx);
        this.dynamicElements.sample.statMarkers = statMarkers[0];
        this.dynamicElements.sample.distStatMarkers = statMarkers[1];
        if(statMarkers[1].length > 0){
            this.dynamicElements.selectedDistStatMarker = statMarkers[1][0];
        }

        for(var e in distElement){
            distElement[e].show();
        }

    }
    scale(x){
        if(this.ctx){
            this.ctx.scale(x, 1);
            this.dynamicCtx.scale(x, 1);
            d3.select("#svgContainer").attr("transform","scale("+x+",1)");
        }
    }

    initVisualisation(){
        requestAnimationFrame(this.visPrepFrame.bind(this));
    }
    visPrepFrame(timestamp){
        this.curTime = timestamp;
        if(this.startTime == null) this.startTime = timestamp;
        if(this.lastTimeStamp == null) this.lastTimeStamp = timestamp;
        var timeSinceLastFrame = timestamp - this.lastTimeStamp;
        var timeDiff = timestamp - this.startTime;
        if(this.stageStartTime == null) this.stageStartTime = timestamp;
        if(this.updateTime == null) this.updateTime = 0;
        if(this.paused) {
            // If we are paused we want to move stageStartTime and Update time
            this.stageStartTime += timeSinceLastFrame;
            this.updateTime += timeSinceLastFrame;
        }
        this.lastTimeStamp = timestamp;
        var stageTime = timestamp - this.stageStartTime;
        var stageProgress = 0;
        var timeSinceLastUpdate = timestamp - this.updateTime ;
        var update = false;
        if(timeSinceLastUpdate > 1){
            update = true;
            this.updateTime = timestamp;
        }




        // check if an animation is loaded
        if(this.animation && !this.animation.done){

            // check if we should be updating this frame
            if(update){

                // check that a stage is loaded, or load one if availiable
                var stageLoaded = true;
                if(this.animation.getStage() == null){
                    if(this.animation.nextStageAvailiable()){
                        this.animation.nextStage();
                        this.stageStartTime = timestamp;
                        stageTime = 0;
                    }else{
                        stageLoaded = false;
                    }
                }

                if(this.animation.done){
                    stageLoaded = false;
                }
                var shouldLoadNext = false;
                if(stageLoaded){
                    // check stage progress
                    var stageDuration, currentStage, numToSkip;
                    stageDuration = this.animation.getStageDuration();
                    stageProgress = stageTime/stageDuration;
                    currentStage = this.animation.getStage(); 

                    // If we have done this stage, check if we can load the next
                    if(stageProgress > 1){
                        numToSkip = Math.floor(stageProgress);
                        if(this.animation.stages.length > parseInt(this.animation.currentStage) + numToSkip){
                        //if(this.animation.nextStageAvailiable()){
                            currentStage = this.animation.getStage();
                            shouldLoadNext = true;
                            //this.animation.nextStage();
                            this.stageStartTime = timestamp;
                            stageTime = 0;
                            stageProgress = 1;
                        }else{
                            // Otherwise we have finished the animation and should stop.
                            this.animDone = true;
                            this.animation.finish();
                            this.animationFinished();
                            stageProgress = 1;
                        }
                    }

                    // If we have not finished the animation, update elements.
                    if(!this.animation.done){
                        var updatingElements = currentStage.elements;
                        for (var e in updatingElements){
                            updatingElements[e].update(stageProgress);
                        }
                        if(shouldLoadNext){
                            this.animation.nextStage(numToSkip);
                        }
                        visAnimDraggableProgress(this.animation, stageProgress);

                    }
                }
            }
        }
        if(state.shouldDraw) this.drawDynamic();
        requestAnimationFrame(this.visPrepFrame.bind(this));
    }

    draw(){
        this.clearScreen(this.dynamicCtx);
        for (var s in this.sections){
            this.sections[s].draw();
        }
        for (s in this.dynamicSections){
           // this.dynamicSections[s].draw();
        }
    }
    drawPop(){
        this.clearScreen(this.ctx);
        for (var s in this.sections){
            this.sections[s].draw();
        }
    }
    drawDynamic(){
        this.clearScreen(this.dynamicCtx);
        for (var s in this.dynamicSections){
            this.dynamicSections[s].draw();
        }
    }
    updateDynamic(stageProgress){
        for (var s in this.dynamicSections){
            this.dynamicSections[s].update(stageProgress);
        }
    }
    nextSample(index){
        this.setupSample(index);
    }
    clearScreen(ctx){
        clearScreen(ctx);
    }
    clearAll(){
        if(this.dynamicSections){
            this.dynamicSections.s2.elements[1].elements = [];
            this.dynamicSections.s3.elements[1].elements = [];
        }
    }
    clearStatic(){

    }
    clearSample(){
        // Clear sample section elements
        if(this.dynamicSections){
            this.dynamicSections.s2.elements[1].elements = [];
            d3.selectAll(".sampleDP").remove();
        }
    }
    pause(){
        if(!this.paused){
            this.paused = true;
            this.pauseTime = this.curTime;
        }
    }
    unpause(){
        this.paused = false;
    }
    animationFinished(){
        this.endAnimRepeator();
    }
    beginAnimationSequence(repititions, animationConstructor, reset = false){
        var count = 0;
        if(state.selectedSample >= 990 || state.resetDist){
            for(var d in this.dynamicElements.distribution.datapoints){
                this.dynamicElements.distribution.datapoints[d].hide();

            }
            d3.selectAll(".distDP").attr("visibility", "hidden");
            for(var d in this.dynamicElements.distribution.CI){
                this.dynamicElements.distribution.CI[d].hide();

            }
            this.dynamicElements.distribution.statMarkers = [];
            this.dynamicSections.s3.elements[1].elements = this.dynamicSections.s3.elements[1].elements.slice(0,2);
            state.selectedSample = 0;
            state.lastSelectedSample = 0;
            state.resetDist = false;
        }
        var endAnimRepeator = function(){
            count++;
            if(count > repititions) return;
            state.shouldDraw = false;
            state.lastSelectedSample = state.selectedSample;
            if(state.selectedSample >= 990){
                for(var d in this.dynamicElements.distribution.datapoints){
                    this.dynamicElements.distribution.datapoints[d].hide();
                }
                state.selectedSample = 0;
                state.lastSelectedSample = 0;
            }
            //state.selectedSample += repititions < 99 ? 1 : 10;
            state.selectedSample++;
            state.selectedSample = ((state.selectedSample%state.numSamples)+state.numSamples)%state.numSamples;
            
            this.setupSample(state.selectedSample, state.lastSelectedSample);


            //create animation;
            this.animation = animationConstructor(this.dynamicElements);
            if(this.animation.getStage() == null) {
                this.animation.nextStage();
                var updating = this.animation.getStage().elements;
                for (var e in updating){
                    updating[e].update(0);
                }
                this.stageStartTime = this.curTime;
            }
            
            this.animDone = false;
            visSampleChange(1);
            visAnimDraggableInit(this.animation);
            state.shouldDraw = true;
        }.bind(this);

        this.endAnimRepeator = endAnimRepeator;
        this.endAnimRepeator();
    }
    setAnimProgress(stage, stageProgress, syntheticStartTimeDiff){
        if(this.animation.done){
            var updating = this.animation.getStage().elements;
            for (var e in updating){
                updating[e].update(0);
            }
        }
        if(this.animation.currentStage != stage || this.animation.done) {
            var updatingElements = this.animation.getStage().elements;
            for (var e in updatingElements){
                updatingElements[e].update(stageProgress > 0.5 ? 0 : 1);
            }
            this.animation.startStage(stage);
        }
        this.animation.playing = true;
        this.animation.done = false;
        this.animation.currentStage = stage;
        this.stageStartTime = this.curTime - syntheticStartTimeDiff;
        var updatingElements = this.animation.getStage().elements;
        for (var e in updatingElements){
            updatingElements[e].update(stageProgress);
        }
    }

}