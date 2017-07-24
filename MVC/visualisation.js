/*jshint esversion: 6 */
class visualisation {
    constructor(){

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
            setupNumerical(this.population, this.ctx, popSectionDisplayArea, popScale, populationSections);
        }else if(this.dimensions[0].type == 1){
            popScale.domain([0,1]);
            setupProportional(this.population, this.ctx, popSectionDisplayArea, popScale, populationSections);
        }

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
        setupDistribution(state.sampleData.distribution, this.dynamicCtx, distSectionDisplayArea, this.distScale);
        this.drawPop();
    }
    setupSample(sampleID){
        this.clearSample();
        var sampleSectionDisplayArea = this.dynamicSections.s2.elements[1];
        var distElement = vis.dynamicSections.s3.elements[1].elements[0].elements[sampleID];
        var sampleSections = setupSection(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea);
        if(state.sampleData.dimensions[0].type == 0){
            setupNumerical(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea, this.popScale, sampleSections);
        }else if(state.sampleData.dimensions[0].type == 1){
            setupProportional(state.sampleData.samples[sampleID], this.dynamicCtx, sampleSectionDisplayArea, this.popScale, sampleSections);
        }
        setupPopStatistic(state.sampleData.samples[sampleID], sampleSectionDisplayArea, this.popScale, false,  this.dynamicCtx);
        distElement.show();
        this.drawDynamic();
    }
    scale(x){
        if(this.ctx){
            this.ctx.scale(x, 1);
        }
    }

    draw(){
        this.clearScreen(this.dynamicCtx);
        for (var s in this.sections){
            this.sections[s].draw();
        }
        for (s in this.dynamicSections){
            this.dynamicSections[s].draw();
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


}