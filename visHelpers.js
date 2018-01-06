function elementsFromDataset(dataset, dimensions, bounds, options){
    let statistic = options["Statistic"];
    let elements = {all:[], factors:[]};
    let num_factors = dimensions.length < 2 || dimensions[1].type == 'numeric' ? 1 : dimensions[1].factors.length;
    for(let i = 0; i < num_factors; i++){
        elements.factors.push([]);
    }
    if(dimensions[0].type == 'numeric'){
        for(let i in dataset.all){
            let datapoint = dataset.all[i];
            let y_factor = dimensions.length < 2 || dimensions[1].type == 'numeric' ? "" : datapoint[dimensions[1].name];
            let y_factor_index = dimensions.length < 2 || dimensions[1].type == 'numeric' ? 0 : dimensions[1].factors.indexOf(y_factor);
            let el = new visElement(i, 'datapoint');
            for(let attr in datapoint){
                let val = datapoint[attr];
                el.setAttr(attr, val);
            }
            el.setAttr('factor', y_factor);
            el.value = datapoint[dimensions[0].name];
            elements.all.push(el);
            elements.factors[y_factor_index].push(el);
        }
    }else{
        if(dimensions.length >= 2){
            for(let i in dimensions[1].factors){
                let y_factor = dimensions[1].factors[i];
                let y_factor_ds = dataset[dimensions[1].name]["own"+y_factor];
                let y_factor_prop = y_factor_ds.statistics.propY;
                for(let n in dimensions[0].factors){
                    let x_factor = dimensions[0].factors[n];
                    let x_factor_prop = dataset[dimensions[1].name]["own"+y_factor][dimensions[0].name][x_factor].statistics.propX;
                    let actual_prop = x_factor_prop/y_factor_prop;
                    let el = new visElement(parseInt(i) * parseInt(n) + parseInt(n), 'prop');
                    el.setAttr('prop', actual_prop);
                    el.setAttr('factorY', y_factor);
                    el.setAttr('factorX', x_factor);
                    elements.all.push(el);
                    elements.factors[dimensions[1].factors.indexOf(y_factor)].push(el);
                }
            }
        }else{
            for(let n in dimensions[0].factors){
                let x_factor = dimensions[0].factors[n];
                let x_factor_prop = dataset[dimensions[0].name]["own"+x_factor].statistics.propX;
                let actual_prop = x_factor_prop;
                let el = new visElement(n, 'prop');
                el.setAttr('prop', actual_prop);
                el.setAttr('factorY', "");
                el.setAttr('factorX', x_factor);
                elements.all.push(el);
                elements.factors[0].push(el);
            }
        }
    }
    return elements;

}

function placeElements(elements, dimensions, bounds, options){
    let num_factors = elements.factors.length;
    for(let f = 0; f < num_factors; f++){
        let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
        if(dimensions[0].type == 'numeric'){
            heap(elements.factors[f], factor_bounds);
            console.log(elements);

        }else{
            let sum = 0;
            let height = (factor_bounds.bottom - factor_bounds.top) / 2;
            let mid_y = ( height) + factor_bounds.top;
            
            for(let e = 0; e < elements.factors[f].length; e++){
                let prop_rect = elements.factors[f][e];
                let width = linearScale(prop_rect.getAttr('prop'), [0, 1], [0, factor_bounds.right - factor_bounds.left]);
                prop_rect.setAttr('y', mid_y - height/2);
                prop_rect.setAttr('x', factor_bounds.left + sum);
                prop_rect.setAttr('width', width);
                prop_rect.setAttr('height', height);
                sum += width;
            }
            console.log(sum);
        }
        
    }
}

function linearScale(value, domain, range){
    let proportion = (value - domain[0]) / (domain[1] - domain[0]);
    return proportion * (range[1] - range[0]) + range[0];
}

function heap(elements, bounds){
    let numBuckets = 300;
    let buckets = {};
    let tallestBucketHeight = 0;
    let max = elements.reduce((a, c)=> c.value > a ? c.value : a, -100000);
    let min = elements.reduce((a, c)=> c.value < a ? c.value : a, 1000000);
    for(let d in elements){
        let datapoint = elements[d];
        let screen_x = linearScale(datapoint.value, [min, max], [bounds.left, bounds.right]);
        let bucket = Math.floor(linearScale(screen_x, [bounds.left, bounds.right], [0, numBuckets] ));
        if(!(bucket in buckets)) buckets[bucket] = [];
        buckets[bucket].push(datapoint);
        if(buckets[bucket].length > tallestBucketHeight) tallestBucketHeight = buckets[bucket].length;
    }
    var spaceAvaliable = bounds.bottom - bounds.top;
    var spacePerElement = Math.min(spaceAvaliable/tallestBucketHeight, 5);
    for(var b in buckets){
        for(var e in buckets[b]){
            buckets[b][e].setAttr('x', linearScale(buckets[b][e].value, [min, max], [bounds.left, bounds.right]))
            buckets[b][e].setAttr('y', bounds.bottom - spacePerElement * e)
        }
    }
}

function sectionAreas(overall_bounds){
    let areas = {};
    areas.overall = new Area(overall_bounds.left, overall_bounds.right, overall_bounds.top, overall_bounds.bottom);
    let num_sections = 3;
    for(let i = 0; i < num_sections; i++){
        let sec_bounds = {left: overall_bounds.left, right: overall_bounds.right, top: (i) * (overall_bounds.height / num_sections), bottom: (i+1) * (overall_bounds.height / num_sections)};
        areas["sec"+i] = new Area(sec_bounds.left, sec_bounds.right, sec_bounds.top, sec_bounds.bottom);
        let ten = areas["sec"+i].split(10, 1)[1];
        areas["sec"+i+"title"] = new Area(sec_bounds.left, sec_bounds.right, sec_bounds.top, ten);
        let ninty = areas["sec"+i].split(10, 9)[1];
        areas["sec"+i+"display"] = new Area(sec_bounds.left, sec_bounds.right, ten, ninty);
        areas["sec"+i+"axis"] = new Area(sec_bounds.left, sec_bounds.right, ninty, sec_bounds.bottom);
    }
    let sec_bounds = {left: overall_bounds.left, right: overall_bounds.right, top: (2) * (overall_bounds.height / num_sections), bottom: (3) * (overall_bounds.height / num_sections)};
    let seventy = areas["sec2"].split(10, 7)[0];
    areas["sec2regL"] = new Area(sec_bounds.left, seventy, sec_bounds.top, sec_bounds.bottom);
    let ten = areas["sec2regL"].split(10, 1)[1];
    areas["sec2regL"+"title"] = new Area(sec_bounds.left, seventy, sec_bounds.top, ten);
    let ninty = areas["sec2regL"].split(10, 9)[1];
    areas["sec2regL"+"display"] = new Area(sec_bounds.left, seventy, ten, ninty);
    areas["sec2regL"+"axis"] = new Area(sec_bounds.left, seventy, ninty, sec_bounds.bottom);

    areas["sec2regR"] = new Area(seventy, sec_bounds.right, sec_bounds.top, sec_bounds.bottom);
    ten = areas["sec2regR"].split(10, 1)[1];
    areas["sec2regR"+"title"] = new Area(seventy, sec_bounds.right, sec_bounds.top, ten);
    ninty = areas["sec2regR"].split(10, 9)[1];
    areas["sec2regR"+"display"] = new Area(seventy, sec_bounds.right, ten, ninty);
    areas["sec2regR"+"axis"] = new Area(seventy, sec_bounds.right, ninty, sec_bounds.bottom);

    return areas;
}

class Area {
    constructor(l, r, t, b){
        this.top = t;
        this.bottom = b;
        this.left = l;
        this.right = r;
        this.margin = 5;
        this.innerLeft = this.left + this.margin;
        this.innerRight = this.right - this.margin;
        this.innerTop = this.top + this.margin;
        this.innerBottom = this.bottom - this.margin;
        this.width = r - l;
        this.height = b - t;
        this.innerWidth = this.width - this.margin*2;
        this.innerHeight = this.height - this.margin*2;
    }
    split(divisions, selected){
        let div_x = this.innerWidth / divisions;
        let div_y = this.innerHeight / divisions;
        return [this.innerLeft + div_x * selected, this.innerTop + div_y * selected];
    }
}