class visualisation {
    constructor(){

    }
    setup(population, module){
        this.canvas = document.getElementById('popCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.population = population;
        this.dimensions = population.dimensions;
        this.sections = createSections($('.mainCanvas'), this.ctx, 5, 10);
        this.module = module.name;

        this.singleNumericalStatistics = ['Mean', 'Median'];
        this.singleCategoricalStatistics = ['Proportion'];
        this.dualNumericalStatistics = ['Diff'];
        this.dualCategoricalStatistics = ['Diff'];
        this.multiNumericalStatistics = ['Variance', 'FStat'];
        this.multiCategoricalStatistics = ['Variance', 'FStat'];
    }
    sampleSizeMax(){
        return this.population ? this.population.allDataPoints.length : 0;
    }
    sampleSizeDefault(){
        return this.module != "Sampling Variation" ? this.sampleSizeMax() : Math.min(Math.ceil(this.population.allDataPoints.length / 2), 40);
    }
    getStatisticsOptions(){
        if(this.dimensions.length == 1){
            var type = this.dimensions[0].type;
            return type == 0 ? this.singleNumericalStatistics : this.singleCategoricalStatistics;
        }else if(this.dimensions.length == 2 && this.dimensions[1].categories.length == 2){
            var type = this.dimensions[0].type;
            return type == 0 ? this.dualNumericalStatistics : this.dualCategoricalStatistics;
        }else{
            var type = this.dimensions[0].type;
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

    }  
    scale(x){
        if(this.ctx){
            this.ctx.scale(x, 1);
        }
    }

    draw(){
        for (var s in this.sections){
            this.sections[s].draw();
        }
    }
}