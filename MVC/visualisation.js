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
        }else if(this.dimensions.length == 2 && this.dimensions[1].categories.length == 2 || this.module.name == "Randomisation Variation"){
            type = this.dimensions[0].type;
            return type == 0 ? this.dualNumericalStatistics : this.dualCategoricalStatistics;
        }else{
            type = this.dimensions[0].type;
            return type == 0 ? this.multiNumericalStatistics : this.multiCategoricalStatistics;
        }
    }
    setupPopulationElements(){
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
        setupPopStatistic(this.population, popSectionDisplayArea, popScale, true,  this.ctx);

        // Save scale
        this.popScale = popScale;

    }
    setupSampleElements(){
        this.clearAll();
        var sampleSectionAxisArea = this.sections.s2.elements[2];
        setupPopAxis(sampleSectionAxisArea, this.popScale, this.ctx);
        var sampleLabelArea = this.sections.s2.elements[0];
        setupLabel(this.module.labels[1], sampleLabelArea, this.ctx);

        this.distScale = getDistributionScale();
        var distSectionAxisArea = this.sections.s3.elements[2];
        setupPopAxis(distSectionAxisArea, this.distScale, this.ctx);
        var distLabelArea = this.sections.s3.elements[0];
        setupLabel(this.module.labels[2], distLabelArea, this.ctx);

        var distSectionDisplayArea = this.dynamicSections.s3.elements[1];
        this.dynamicElements.distribution = {container:distSectionDisplayArea};
        this.dynamicElements.distribution.datapoints = 
            setupDistribution(state.sampleData.distribution, this.dynamicCtx, distSectionDisplayArea, this.distScale);
        
        this.drawPop();
    }
    setupSample(sampleID){
        this.clearSample();
        var sampleSectionDisplayArea = this.dynamicSections.s2.elements[1];
        var distElement = this.dynamicElements.distribution.datapoints[sampleID];
        this.dynamicElements.selectedDistElements = [distElement];
        var sampleSections = setupSection(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea);
        this.dynamicElements.sample = {container: sampleSectionDisplayArea};
        if(state.sampleData.dimensions[0].type == 0){
            this.dynamicElements.sample.datapoints = 
                setupNumerical(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea, this.popScale, sampleSections);
        }else if(state.sampleData.dimensions[0].type == 1){
            this.dynamicElements.sample.datapoints = 
                setupProportional(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea, this.popScale, sampleSections);
        }
        this.dynamicElements.sample.statMarkers = setupPopStatistic(state.sampleData.samples[sampleID], sampleSectionDisplayArea, this.popScale, false,  this.dynamicCtx);
        distElement.show();

        var testAnimElement = new visElement('rect', 'test', this.dynamicCtx);
            sampleSectionDisplayArea.addChild(testAnimElement);
            testAnimElement.setBoundingBox(0,0,5,5);
            testAnimElement.setRelativeCenter(0,0, sampleSectionDisplayArea.boundingBox);
            testAnimElement.drawSelf = testAnimElement.renderBB;
            this.dynamicElements.test = testAnimElement;

        // this.animation = createSquareAnim(testAnimElement);
        // this.animDone = false;
        // //this.drawDynamic();
    }
    scale(x){
        if(this.ctx){
            this.ctx.scale(x, 1);
            this.dynamicCtx.scale(x, 1);
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
                    var stageDuration, currentStage;
                    stageDuration = this.animation.getStageDuration();
                    stageProgress = stageTime/stageDuration;
                    currentStage = this.animation.getStage(); 

                    // If we have done this stage, check if we can load the next
                    if(stageProgress > 1){
                        if(this.animation.nextStageAvailiable()){
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
                            this.animation.nextStage();
                        }
                        visAnimDraggableProgress(this.animation, stageProgress);

                    }
                }
            }
        }
        if(state.shouldDraw != false && this.animation.currentStage != null) this.drawDynamic();
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
    clearSample(){
        // Clear sample section elements
        if(this.dynamicSections){
            this.dynamicSections.s2.elements[1].elements = [];
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
    beginAnimationSequence(repititions, animationConstructor){
        var count = 0;
        var endAnimRepeator = function(){
            count++;
            if(count > repititions) return;
            state.selectedSample++;
            state.selectedSample = ((state.selectedSample%state.numSamples)+state.numSamples)%state.numSamples;
            state.shouldDraw = false;
            this.setupSample(state.selectedSample);


            //create animation;
            this.animation = animationConstructor(this.dynamicElements);
            
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