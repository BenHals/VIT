const vis = {
    init: function(){
        this.destroy();
        this.canvas = document.getElementById('popCanvas');
        this.dynamicCanvas = document.getElementById('dynamicCanvas');
        this.staticOnTopCanvas = document.getElementById('staticOnTopCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dynamicCtx = this.dynamicCanvas.getContext('2d');
        this.staticOnTopCtx = this.staticOnTopCanvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.oImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.dynamicCtx.imageSmoothingEnabled = false;
        this.dynamicCtx.mozImageSmoothingEnabled = false;
        this.dynamicCtx.oImageSmoothingEnabled = false;
        this.dynamicCtx.webkitImageSmoothingEnabled = false;

        this.staticElements = {};
        this.staticElements.ontop = [];
        this.dynamicElements = {};
        this.interpolators = [];
        let canvas_bounds = this.canvas.getBoundingClientRect();
        canvas_bounds.width = this.canvas.getAttribute("width");
        canvas_bounds.height = this.canvas.getAttribute("height");
        let PIXEL_RATIO = 1
        this.areas = sectionAreas({top: 0, left: 0, right: canvas_bounds.width, bottom: canvas_bounds.height, width: canvas_bounds.width, height: canvas_bounds.height, PIXEL_RATIO: PIXEL_RATIO});

        this.current_stage = 0;
        this.last_frame = null;
        this.current_animation_percent = 0;
        this.paused = false;
        this.loop_started = false;
        this.reqAnimationFrame = undefined;
        this.static_draw_index = 0;
        this.current_sample = 0;
        this.last_animation_type = undefined;

    },
    initModule: function(module, options){
        this.module = module;
        this.options = options;
    },
    initDimensions: function(population_dimensions, sample_dimensions){
        this.dimensions = population_dimensions;
        this.population_dimensions = population_dimensions;
        this.sample_dimensions = sample_dimensions;
    },
    initOptions: function(options){
        this.options = options;
    },
    initPopulation: function(dataset){
        this.initPreview(dataset);

        if(this.population_dimensions[0].type == 'numeric'){
            this.popMax = this.staticElements.datapoints.all.reduce((a, c)=> c.attrs[this.population_dimensions[0].name] > a ? c.attrs[this.population_dimensions[0].name] : a, -100000);
            this.popMin = this.staticElements.datapoints.all.reduce((a, c)=> c.attrs[this.population_dimensions[0].name] < a ? c.attrs[this.population_dimensions[0].name] : a, 100000);
            let scale = d3.scaleLinear().domain([this.popMin, this.popMax]).nice();
            let extent = scale.domain();
            this.popMax = extent[1];
            this.popMin = extent[0];

        }else{
            this.popMax = 1;
            this.popMin = 0;
        }
        let stat_markers = statisticsFromElements(
            this.staticElements.datapoints,
            this.population_dimensions,
            this.areas["sec0display"],
            this.options,
            dataset,
            this.popMin,
            this.popMax,
            this.areas
        );
        this.staticElements.stat_markers = stat_markers;
        this.staticElements.all = this.staticElements.all.concat(stat_markers);
        let axis = axisFromDataset(this.areas["sec0axis"], this.popMin, this.popMax);
        this.staticElements.pop_axis = axis;
        this.staticElements.all = this.staticElements.all.concat(axis);
        this.drawStatic();
        
    },
    initSamples: function(samples, distribution){
        this.current_sample - 0;
        this.samples = samples;
        this.distribution = distribution;
        this.dynamicElements.all = [];
        this.initDistribution(this.distribution);
        //this.initSample(this.samples[this.current_sample], this.dynamicElements.distribution.stats[this.current_sample], true);
        
        this.drawDynamic();
    },
    initPreview: function(dataset){
        clearSvg('popSvgContainer');
        this.dataset = dataset;
        let statistic = this.options.Statistic;
        let datapoints = elementsFromDataset(dataset, this.population_dimensions, this.areas["sec0display"], this.options, statistic);
        
        
        this.staticElements.datapoints = datapoints;
        this.staticElements.all = [].concat(datapoints.all);

        let factor_labels = labelsFromDimensions(this.population_dimensions, this.areas["sec0display"], this.options);
        this.staticElements.factor_labels = factor_labels;
        this.staticElements.all = this.staticElements.all.concat(factor_labels);

        let section_labels = labelsFromModule(this.module.labels, this.areas, this.options);
        this.staticElements.section_labels = section_labels;
        this.staticElements.all = this.staticElements.all.concat(section_labels);

        if(this.population_dimensions[0].type == 'numeric'){
            this.popMax = this.staticElements.datapoints.all.reduce((a, c)=> c.attrs[this.population_dimensions[0].name] > a ? c.attrs[this.population_dimensions[0].name] : a, -100000);
            this.popMin = this.staticElements.datapoints.all.reduce((a, c)=> c.attrs[this.population_dimensions[0].name] < a ? c.attrs[this.population_dimensions[0].name] : a, 100000);
            let scale = d3.scaleLinear().domain([this.popMin, this.popMax]).nice();
            let extent = scale.domain();
            this.popMax = extent[1];
            this.popMin = extent[0];

        }else{
            this.popMax = 1;
            this.popMin = 0;
        }
        placeElements(datapoints, this.population_dimensions, this.areas["sec0display"], this.options, this.popMin, this.popMax);
        this.drawStatic();
    },
    initDistribution: function(distribution){
        let statistic = this.options.Statistic;
        let min = 0;
        let max = 1;
        if(statistic == "Slope"){
            max = distribution.reduce((a, c)=> c.point_value > a ? c.point_value : a, -100000);
            min = distribution.reduce((a, c)=> c.point_value < a ? c.point_value : a, 100000);
            min =Math.min(min, 0);
            max = Math.max(0, max);
        }else if(this.sample_dimensions.length < 2 && statistic == 'proportion'){
            max = 1;
            min = 0; 
        }else if(this.sample_dimensions.length > 1 && this.sample_dimensions[1].factors.length == 2){
            max = 0 + (this.popMax - this.popMin)/2;
            min = 0 - (this.popMax - this.popMin)/2; 
        }else if(this.sample_dimensions.length > 1 && this.sample_dimensions[1].factors.length > 2){
            max = 0 + (this.popMax - this.popMin);
            min = 0; 
        }else {
            max = this.popMax;
            min = this.popMin; 
        }
        
        let area_heap = this.areas["sec2display"];
        let area_stat = this.areas["sec1display"];
        let area_axis = this.areas["sec2axis"];
        let vertical = false;
        if(this.sample_dimensions.length == 2 && this.sample_dimensions[0].type == 'numeric' && this.sample_dimensions[1].type == 'numeric'){
            area_heap = this.areas["sec2regRdisplay"];
            area_stat = this.areas["sec2regLdisplay"];
            area_axis = this.areas["sec2regRaxis"];
            vertical = true;
        }
        let [datapoints, stats, ci, extra] = elementsFromDistribution(
                distribution,
                this.samples,
                this.sample_dimensions,
                area_stat, this.options,
                this.popMin,
                this.popMax,
                min,
                max,
                this.module.inCI,
                getPopulationStatistic(this.dataset, statistic, this.dimensions),
                this.dataset.largeCI
            );
        placeDistribution(datapoints, ci, area_heap, vertical, min, max, this.staticElements.stat_markers, this.dataset.largeCI);
        this.dynamicElements.distribution = {};
        this.dynamicElements.distribution.datapoints = datapoints;
        let prev_all = this.dynamicElements.all || [];
        //this.dynamicElements.all = prev_all.concat(datapoints);
        this.dynamicElements.distribution.stats = stats;
        this.dynamicElements.distribution.ci = ci;
        

        let axis = axisFromDataset(area_axis, min, max, vertical);
        this.staticElements.dist_axis = axis;
        this.staticElements.all = this.staticElements.all.concat(axis);

        if(extra) this.staticElements.ontop = this.staticElements.ontop.concat(extra);

        this.drawDynamic();
    },
    initSample: function(dataset, stats, dist){
        clearSvg('dynSvgContainer');
        clearSvgTextLines('popSvgContainer');
        let statistic = this.options.Statistic;
        let datapoints = elementsFromDataset(dataset, this.sample_dimensions, this.areas["sec1display"], this.options, statistic);
        placeElements(datapoints, this.sample_dimensions, this.areas["sec1display"], this.options, this.popMin, this.popMax);
        this.dynamicElements.datapoints = datapoints;
        if(dist) {
            this.initSampleDistElements(datapoints);
        }else{
            this.dynamicElements.all = this.dynamicElements.all.concat(datapoints.all);
        }

        let factor_labels = labelsFromDimensions(this.sample_dimensions, this.areas["sec1display"], this.options);
        this.dynamicElements.factor_labels = factor_labels;
        this.dynamicElements.all = this.dynamicElements.all.concat(factor_labels);

        // let section_labels = labelsFromModule(this.module.labels, this.areas, this.options);
        // this.dynamicElements.section_labels = section_labels;
        // this.dynamicElements.all = this.dynamicElements.all.concat(section_labels);

        let sample_stat_markers = statisticsFromElements(this.dynamicElements.datapoints, this.sample_dimensions, this.areas["sec1display"], this.options, this.dataset, this.popMin, this.popMax);
        if(!this.dynamicElements.stat_markers) this.dynamicElements.stat_markers = [];
        this.dynamicElements.stat_markers = this.dynamicElements.stat_markers.concat(sample_stat_markers);
        this.dynamicElements.all = this.dynamicElements.all.concat(sample_stat_markers);

        let axis = axisFromDataset(this.areas["sec1axis"], this.popMin, this.popMax, false, 'sample_axis');
        this.staticElements.sample_axis = axis;
        this.staticElements.all = this.staticElements.all.filter((e)=>e.id != 'sample_axis').concat(this.staticElements.sample_axis);

        this.drawDynamic();
        this.drawStatic();
        this.drawStaticOnTop();
        dd_updateDatapoints(dataset, this.population_dimensions, this.sample_dimensions);
    },
    initSampleDistElements(datapoints){
        this.dynamicElements.all = [].concat(datapoints.all);
        this.dynamicElements.ghosts = [];
        this.dynamicElements.new_ghosts = [];
        this.dynamicElements.stat_markers = [];
        for(let i = 0; i < this.dynamicElements.distribution.stats.length && i < this.current_sample; i++){
            //this.dynamicElements.all = this.dynamicElements.all.concat(this.dynamicElements.distribution.stats[i]);
            this.dynamicElements.ghosts = this.dynamicElements.ghosts.concat(this.dynamicElements.distribution.stats[i]);
            this.dynamicElements.all = this.dynamicElements.all.concat(this.dynamicElements.distribution.stats[i]);
            this.dynamicElements.all = this.dynamicElements.all.concat([this.dynamicElements.distribution.datapoints[i]]);
        }
        this.dynamicElements.new_ghosts.push(this.dynamicElements.distribution.stats[this.current_sample]);
        this.dynamicElements.all.push(this.dynamicElements.distribution.datapoints[this.current_sample]);
    },
    initAnimation: function(reps, include_distribution, track, inherit_speed = false){
        this.pause();
        this.reps_left = reps - 1;
        // let speed = this.speed || 1 + 0.75*(reps - 1);
        let speed = inherit_speed ? this.speed : (1 + 0.75*(reps - 1)) * (1 + 1 * include_distribution);
        this.speed = speed;
        this.include_distribution = include_distribution;
        let animation = new Animation(`${reps}:${include_distribution}`);
        if(reps < 900){
            if(this.current_sample >= 1000){
                this.current_sample = 0;
                this.dynamicElements.all = [];
            }
            this.initSample(this.samples[this.current_sample], this.dynamicElements.distribution.stats[this.current_sample], true);
            
            ma_createAnimation(animation, this.population_dimensions, this.sample_dimensions, this.staticElements, this.dynamicElements, this.module, speed, this.current_sample, include_distribution, track);
            this.animation = animation;
            this.animation.start();
            this.current_sample = (this.current_sample + 1)%(this.samples.length);
        }else{
            if(this.current_sample >= 1000){
                this.current_sample = 0;
                this.dynamicElements.all = [];
            }
            this.dynamicElements.all = [];
            for(let i = 0; i < this.dynamicElements.distribution.stats.length; i++){
                this.dynamicElements.all = this.dynamicElements.all.concat(this.dynamicElements.distribution.stats[i]);
                this.dynamicElements.all = this.dynamicElements.all.concat([this.dynamicElements.distribution.datapoints[i]]);
            }
            ma_createDistributionAnimation(animation, this.population_dimensions, this.sample_dimensions, this.staticElements, this.dynamicElements, this.module, 1, this.current_sample);
            this.animation = animation;
            this.animation.start();
            this.current_sample = 1000;
            this.reps_left = 0;
        }
        this.last_animation_type = "normal";
        [this.current_stage, this.current_animation_percent]  = this.animation.progress_time(window.performance.now());
        this.paused = false;
        ac_unpause();
        this.last_frame = window.performance.now();
        if(!this.loop_started) {
            this.loop(window.performance.now(), true);
            this.loop_started = true;
        }

    },
    initCIAnimation(large){
        this.reps_left = 0;
        let speed = 1;
        this.include_distribution = false;
        let animation = new Animation(`ci`);
        ma_createCIAnimation(animation, this.population_dimensions, this.sample_dimensions, this.staticElements, this.dynamicElements, this.module, speed, this.current_sample, this.areas, large);
        this.animation = animation;
        this.animation.start();
        
        [this.current_stage, this.current_animation_percent]  = this.animation.progress_time(window.performance.now());
        if(this.last_animation_type == "ci"){
            this.setProgress(1);
        }
        this.last_animation_type = "ci";
        this.paused = false;
        ac_unpause();
        this.last_frame = window.performance.now();
        if(!this.loop_started) {
            this.loop(window.performance.now());
            this.loop_started = true;
        }
    },
    initRandTestCIAnimation(large){
        this.reps_left = 0;
        let speed = 1;
        this.include_distribution = false;
        let animation = new Animation(`ci`);
        ma_createRandTestCIAnimation(animation, this.population_dimensions, this.sample_dimensions, this.staticElements, this.dynamicElements, this.module, speed, this.current_sample, this.areas, large);
        this.animation = animation;
        this.animation.start();
        [this.current_stage, this.current_animation_percent]  = this.animation.progress_time(window.performance.now());
        if(this.last_animation_type == "randci"){
            this.setProgress(1);
        }
        this.last_animation_type = "randci";
        this.paused = false;
        ac_unpause();
        this.last_frame = window.performance.now();
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

            if(config.element_draw_type[element.type] == "canvas"){
                element.draw(ctx);
            }else if(config.element_draw_type[element.type] == "svg"){
                if(!element.svg_initialised || d3.select('#' + element.svg_id).empty()){
                    let svg_id = '#popSvgContainer';
                    defaultSVGFuncs[element.type](element, svg_id);
                    element.svg_initialised = true;
                }
                element.svgUpdate();
            }
            
        }
    },
    drawStaticOnTop: function(){
        let ctx = this.staticOnTopCtx;
        clearCtx(ctx);
        for(let i = 0; i < this.staticElements.ontop.length; i++){
            let element = this.staticElements.ontop[i];

            if(config.element_draw_type[element.type] == "canvas"){
                element.draw(ctx);
            }else if(config.element_draw_type[element.type] == "svg"){
                if(!element.svg_initialised || d3.select('#' + element.svg_id).empty()){
                    let svg_id = '#popSvgContainer';
                    defaultSVGFuncs[element.type](element, svg_id);
                    element.svg_initialised = true;
                }
                element.svgUpdate();
            }
            
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
        if(!this.dynamicElements.all) return;
        for(let i = 0; i < this.dynamicElements.all.length; i++){
            let element = this.dynamicElements.all[i];
            if(config.element_draw_type[element.type] == "canvas"){
                element.draw(ctx);
            }else if(config.element_draw_type[element.type] == "svg"){
                if(!element.svg_initialised || d3.select('#' + element.svg_id).empty()){
                    let svg_id = '#dynSvgContainer';
                    defaultSVGFuncs[element.type](element, svg_id);
                    element.svg_initialised = true;
                }
                element.svgUpdate();
            }
        }
    },
    loop: function(ts, new_loop = false){
        //let start_t = window.performance.now();
        //if(!this.loop_started) return;
        this.last_frame = this.last_frame || ts;
        if(new_loop) this.last_frame = ts;
        let stage_not_done = true;
        if(!this.paused){
            this.current_animation_percent += (ts-this.last_frame) / this.animation.total_duration;
            stage_not_done = this.setProgress(this.current_animation_percent);
        }
        
        //this.drawStatic();
        if(stage_not_done){
            this.drawDynamic();
            if(this.static_draw_index == 0){
                this.drawStatic();
            }
            this.drawStaticOnTop();
            this.static_draw_index += 1;
            this.static_draw_index %= 3;
            this.last_frame = ts;
            //console.log(window.performance.now() - start_t);
        }

        if(!this.paused){
            this.reqAnimationFrame = requestAnimationFrame(this.loop.bind(this));
        }
        
    },
    animationDone: function(){
        if(this.reps_left > 0) {
            
            this.initAnimation(this.reps_left, this.include_distribution, false, true);
        }else{
            this.speed = null;
            controller.pause();
            controller.animationDone();
            this.updateDynamic(1);
            this.drawDynamic();
            this.drawStatic();
            this.drawStaticOnTop();
        }
        
    },

    setProgress: function(p){
        
        this.current_animation_percent = p;
        // this.animation.percentUpdate(this.current_animation_percent);
        let [stage, stage_percentage] = this.animation.percentUpdate(this.current_animation_percent);
        if(stage != this.current_stage){
            this.animation.startStage(stage);
            this.current_stage = stage;
        }
        
        this.updateDynamic(stage_percentage);
        
        controller.setPlaybackProgress(p);

        if(this.paused && stage_percentage != 1){
            this.drawDynamic();
            this.drawStatic();
            this.drawStaticOnTop();
        }

        return stage_percentage != 1;
        
    },
    pause: function(){
        this.paused = true;
        if(this.reqAnimationFrame){
            cancelAnimationFrame(this.reqAnimationFrame);  
            this.loop_started = false;
        }
        this.last_frame = null;
    },
    unpause: function(){
        this.paused = false;
        
        cancelAnimationFrame(this.reqAnimationFrame); 
        this.loop(window.performance.now());
        this.loop_started = true;
        
    },
    scale: function(scale_x, scale_y, PIXEL_RATIO){
        if(!this.ctx) return;
        // this.drawDynamic();
        // this.drawStatic();
        // this.ctx.scale(scale_x, scale_y);
        // this.dynamicCtx.scale(scale_x, scale_y);
        clearCtx(this.ctx);
        this.drawDynamic();
        this.drawStatic();
    },
    stopAndClear(){
        controller.pause();
        clearSvg('dynSvgContainer');
        clearSvgTextLines('popSvgContainer');
    },
    destroy(){
        if(this.reqAnimationFrame){
            cancelAnimationFrame(this.reqAnimationFrame);  
        }
        
    }
}

class visElement{
    constructor(id, type){
        this.id = id;
        this.type = type;
        this.attrs = {};
        this.svg_id = this.getUniqueId();
    }
    getUniqueId(){
        let id = this.type + '-' + this.id + "-" + Math.round(Math.random() * 100000);
        while(!(d3.select('#' + id).empty())){
            id = this.type + '-' + this.id + "-" + Math.round(Math.random() * 100000);
        }
        return id;
    }
    getAttr(attr){
        if(attr in this.attrs){
            return this.attrs[attr];
        }
    }
    setAttr(attr, val){
        this.attrs[attr] = val;
        
    }
    setAttrInit(attr, val){
        this.attrs[attr] = val;
        this.attrs['init_'+attr] = val;
    }
    draw(ctx){
        if(this.drawFunc){
            this.drawFunc(ctx);
        }else{
            defaultDrawFuncs[this.type](this, ctx);
        }
    }
    svgUpdate(){
        defaultSVGUpdates[this.type](this);
    }
}