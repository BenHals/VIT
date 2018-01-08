const vis = {
    init: function(){
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

        this.staticElements = {};
        this.dynamicElements = {};
        this.interpolators = [];
        let canvas_bounds = this.canvas.getBoundingClientRect();
        this.areas = sectionAreas({top: 0, left: 0, right: canvas_bounds.width, bottom: canvas_bounds.height, width: canvas_bounds.width, height: canvas_bounds.height});

        this.current_stage = 0;
        this.last_frame = null;
        this.current_animation_percent = 0;
        this.paused = false;
        this.loop_started = false;

        this.current_sample = 0;
    },
    initModule: function(module, options){
        this.module = module;
        this.options = options;
    },
    initDimensions: function(dimensions){
        this.dimensions = dimensions;
    },
    initOptions: function(options){
        this.options = options;
    },
    initPopulation: function(dataset){
        this.initPreview(dataset);
        let stat_markers = statisticsFromElements(this.staticElements.datapoints, this.dimensions, this.areas["sec0display"], this.options);
        this.staticElements.stat_markers = stat_markers;
        this.staticElements.all = this.staticElements.all.concat(stat_markers);

        this.drawStatic();
        
    },
    initSamples: function(samples, distribution){
        this.samples = samples;
        this.distribution = distribution;
        this.initDistribution(this.distribution);
        this.initSample(this.samples[this.current_sample]);
        
        this.drawDynamic();
    },
    initPreview: function(dataset){
        let statistic = this.options.Statistic;
        let datapoints = elementsFromDataset(dataset, this.dimensions, this.areas["sec0display"], this.options, statistic);
        placeElements(datapoints, this.dimensions, this.areas["sec0display"], this.options);
        this.staticElements.datapoints = datapoints;
        this.staticElements.all = [].concat(datapoints.all);

        let factor_labels = labelsFromDimensions(this.dimensions, this.areas["sec0display"], this.options);
        this.staticElements.factor_labels = factor_labels;
        this.staticElements.all = this.staticElements.all.concat(factor_labels);

        let section_labels = labelsFromModule(this.module.labels, this.areas, this.options);
        this.staticElements.section_labels = section_labels;
        this.staticElements.all = this.staticElements.all.concat(section_labels);
        this.drawStatic();
    },
    initDistribution: function(distribution){
        let statistic = this.options.Statistic;
        let datapoints = elementsFromDistribution(distribution, this.options);
        let area = this.areas["sec2display"];
        let vertical = false;
        if(this.dimensions.length == 2 && this.dimensions[0].type == 'numeric' && this.dimensions[1].type == 'numeric'){
            area = this.areas["sec2regRdisplay"];
            vertical = true;
        }
        placeDistribution(datapoints, area, vertical);
        this.dynamicElements.distribution = datapoints;
        let prev_all = this.dynamicElements.all || [];
        this.dynamicElements.all = prev_all.concat(datapoints);
        this.drawDynamic();
    },
    initSample: function(dataset){
        let statistic = this.options.Statistic;
        let datapoints = elementsFromDataset(dataset, this.dimensions, this.areas["sec1display"], this.options, statistic);
        placeElements(datapoints, this.dimensions, this.areas["sec1display"], this.options);
        this.dynamicElements.datapoints = datapoints;
        this.dynamicElements.all = this.dynamicElements.distribution.concat(datapoints.all);

        let factor_labels = labelsFromDimensions(this.dimensions, this.areas["sec1display"], this.options);
        this.dynamicElements.factor_labels = factor_labels;
        this.dynamicElements.all = this.dynamicElements.all.concat(factor_labels);

        let section_labels = labelsFromModule(this.module.labels, this.areas, this.options);
        this.dynamicElements.section_labels = section_labels;
        this.dynamicElements.all = this.dynamicElements.all.concat(section_labels);

        let sample_stat_markers = statisticsFromElements(this.dynamicElements.datapoints, this.dimensions, this.areas["sec1display"], this.options);
        this.dynamicElements.stat_markers = sample_stat_markers;
        this.dynamicElements.all = this.dynamicElements.all.concat(sample_stat_markers);
        this.drawDynamic();
    },
    initAnimation: function(reps, include_distribution){
        let animation = new Animation(`${reps}:${include_distribution}`);
        this.initSample(this.samples[this.current_sample]);
        this.current_sample = (this.current_sample + 1)%(this.samples.length);
        ma_createAnimation(animation, this.staticElements, this.dynamicElements, this.module);
        this.animation = animation;
        this.animation.start();
        [this.current_stage, this.current_animation_percent]  = this.animation.progress_time(window.performance.now());
        if(!this.loop_started) {
            this.loop(window.performance.now());
            this.loop_started = true;
        }

    },
    initInterpolators: function(interpolators){
        this.interpolators = interpolators;
    },
    initStageInitials: function(initials){
        for(let i = 0; i < initials.length; i++){
            let initial = initials[i];
            let element = initial.el;
            let attr = initial.attr;
            let value = initial.value;
            element.setAttr(attr, value);
        }
    },
    updateStatic: function(stage_percentage){
        if(!this.animation.playing) return;
        for(let i = 0; i < this.interpolators.length; i++){
            let interpolator = this.interpolators[i];
            let element = interpolator.el;
            let attr = interpolator.attr;
            let value = interpolator.value(stage_percentage);
            element.setAttr(attr, value);
        }
    },
    updateDynamic: function(stage_percentage){
        if(!this.animation.playing) return;
        for(let i = 0; i < this.interpolators.length; i++){
            let interpolator = this.interpolators[i];
            let element = interpolator.el;
            let attr = interpolator.attr;
            let value = interpolator.value(stage_percentage);
            element.setAttr(attr, value);
        }
    },
    drawStatic: function(){
        let ctx = this.ctx;
        clearCtx(ctx);
        for(let i = 0; i < this.staticElements.all.length; i++){
            let element = this.staticElements.all[i];
            element.draw(this.ctx);
        }
    },
    testSections: function(){
        for(let i in this.areas){
            this.ctx.fillStyle = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
            this.ctx.fillRect(parseInt(this.areas[i].left), this.areas[i].top, this.areas[i].width, this.areas[i].height); 
        }
    },
    drawDynamic: function(){
        let ctx = this.dynamicCtx;
        clearCtx(ctx);
        for(let i = 0; i < this.dynamicElements.all.length; i++){
            let element = this.dynamicElements.all[i];
            element.draw(ctx);
        }
    },
    loop: function(ts){
        let start_t = window.performance.now();
        this.last_frame = this.last_frame || ts;
        if(!this.paused){
            this.current_animation_percent += (ts-this.last_frame) / this.animation.total_duration;
            this.setProgress(this.current_animation_percent);
        }
        
        //this.drawStatic();
        
        this.drawDynamic();
        this.last_frame = ts;
        console.log(window.performance.now() - start_t);
        requestAnimationFrame(this.loop.bind(this));
    },

    setProgress: function(p){
        
        this.current_animation_percent = p;
        this.animation.percentUpdate(this.current_animation_percent);
        let [stage, stage_percentage] = this.animation.percentUpdate(this.current_animation_percent);
        if(stage != this.current_stage){
            this.animation.startStage(stage);
            this.current_stage = stage;
        }
        
        this.updateDynamic(stage_percentage);
        
        controller.setPlaybackProgress(p);
        
    },
    pause: function(){
        this.paused = true;
    },
    unpause: function(){
        this.paused = false;
    }
}

class visElement{
    constructor(id, type){
        this.id = id;
        this.type = type;
        this.attrs = {};
    }
    getAttr(attr){
        if(attr in this.attrs){
            return this.attrs[attr];
        }
    }
    setAttr(attr, val){
        this.attrs[attr] = val;
    }
    draw(ctx){
        if(this.drawFunc){
            this.drawFunc(ctx);
        }else{
            defaultDrawFuncs[this.type](this, ctx);
        }
    }
}