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
    },
    initModule: function(module, options){
        this.module = module;
        this.options = options;
    },
    initDimensions: function(dimensions){
        this.dimensions = dimensions;
    },
    initPopulation: function(dataset){
        let elements = elementsFromDataset(dataset, this.dimensions, this.areas["sec0display"], this.options);

        this.ctx.fillStyle = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
        this.ctx.fillRect(this.areas["sec0display"].left, this.areas["sec0display"].top, this.areas["sec0display"].width, this.areas["sec0display"].height); 
        this.ctx.fillStyle = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
        this.ctx.fillRect(this.areas["sec0display"].innerLeft, this.areas["sec0display"].innerTop, this.areas["sec0display"].innerWidth, this.areas["sec0display"].innerHeight);
        placeElements(elements, this.dimensions, this.areas["sec0display"], this.options);
        for(let i = 0; i < elements.factors.length; i++){
            for(let f = 0; f < elements.factors[i].length; f++){
                let e = elements.factors[i][f];
                this.ctx.fillStyle = "rgba("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+", 0.4)";
                let offset = this.dimensions[0].type=='numeric' ? 5 : 0;
                this.ctx.fillRect(e.attrs.x - offset, e.attrs.y - offset, e.attrs.width || offset*2, e.attrs.height || offset * 2); 
            }   
        }
    },
    initPreview: function(dataset){
        let datapoints = elementsFromDataset(dataset, this.dimensions, this.areas["sec0display"], this.options);
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
    initInterpolators: function(interpolators){
        this.interpolators = interpolators;
    },
    updateStatic: function(){

    },
    updateDynamic: function(){

    },
    drawStatic: function(){
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

    },
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