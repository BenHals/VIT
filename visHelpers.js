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
        elements.all.statistics = dataset.statistics;
        for(let f = 0; f < elements.factors.length; f++){
            let stat = dimensions.length < 2 || dimensions[1].type == 'numeric' ? dataset.statistics : dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[f]].statistics;
            elements.factors[f].statistics = stat;
        }
    }else{
        if(dimensions.length >= 2){
            for(let i in dimensions[1].factors){
                let y_factor = dimensions[1].factors[i];
                let y_factor_ds = dataset[dimensions[1].name]["own"+y_factor];
                let y_factor_prop = y_factor_ds.statistics.proportion;
                for(let n = 0; n < 2; n++){
                    let x_factor = n == 0 ? dimensions[0].focus : dimensions[0].factors.length == 2 ? dimensions[0].factors[1 - dimensions[0].factors.indexOf(dimensions[0].focus)] : "Other";
                    let actual_prop = x_factor == dimensions[0].focus ? y_factor_prop : (1-y_factor_prop);
                    createPropBar(parseInt(i) * parseInt(n) + parseInt(n), actual_prop, y_factor, x_factor, elements.all, elements.factors[dimensions[1].factors.indexOf(y_factor)], dimensions[0].focus);
                    
                }
                elements.factors[dimensions[1].factors.indexOf(y_factor)].statistics = y_factor_ds.statistics;
            }
        }else{
            let y_factor_prop = dataset.statistics.proportion;
            for(let n = 0; n < 2; n++){
                let x_factor = n == 0 ? dimensions[0].focus : dimensions[0].factors.length == 2 ? dimensions[0].factors[1 - dimensions[0].factors.indexOf(dimensions[0].focus)] : "Other";
                let actual_prop = x_factor == dimensions[0].focus ? y_factor_prop : (1-y_factor_prop);
                createPropBar(parseInt(n), actual_prop, '', x_factor, elements.all, elements.factors[0], dimensions[0].focus);
            }
            elements.factors[0].statistics = dataset.statistics;
        }
        elements.all.statistics = dataset.statistics;
    }
    return elements;

}

function createPropBar(id, prop, y, x, all_list, factor_list, focus){
    let el = new visElement(id, 'prop');
    el.setAttr('prop', prop);
    el.setAttr('factorY', y);
    el.setAttr('factorX', x);
    all_list.push(el);
    if(x == focus){
        factor_list.unshift(el);
    }else{
        factor_list.push(el);
    }
    el = new visElement(id+'text', 'text');
    el.setAttr('text', x);
    el.setAttr('y', y);
    el.setAttr('x', x);
    all_list.push(el);
    if(x == focus){
        factor_list.unshift(el);
    }else{
        factor_list.push(el);
    }
}

function labelsFromDimensions(dimensions, bounds, options){
    let factor_labels = dimensions.length > 1 ? dimensions[1].factors : [""];
    let num_factors = factor_labels.length;
    
    let label_elements = factor_labels.map((label, i)=>{
        let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, i)[1], bottom: bounds.split(num_factors, i+1)[1]};
        let el = new visElement(`factor${i}Label`, 'text');
        el.setAttr('text', label);
        el.setAttr('x', factor_bounds.right);
        el.setAttr('y', factor_bounds.top);
        el.setAttr('baseline', 'hanging');
        el.setAttr('align', 'end');
        return el;
    });
    return label_elements
}

function labelsFromModule(labels, areas, options){
    
    let label_elements = labels.map((label, i)=>{
        let factor_bounds = areas[`sec${i}title`];
        let el = new visElement(`section${i}Label`, 'text');
        el.setAttr('text', label);
        el.setAttr('x', factor_bounds.left);
        el.setAttr('y', factor_bounds.top);
        el.setAttr('baseline', 'hanging');
        el.setAttr('align', 'start');
        return el;
    });
    return label_elements
}

function statisticsFromElements(elements, dimensions, bounds, options){
    let new_elements = [];
    let statistic = options.Statistic;
    let num_factors = elements.factors.length;
    if(statistic == 'Mean' || statistic == 'Median'){
        let max_x = elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] > a ? c.attrs[dimensions[0].name] : a, -100000);
        let min_x = elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] < a ? c.attrs[dimensions[0].name] : a, 1000000);
        for(let f = 0; f < num_factors; f++){
            let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
            let factor = elements.factors[f];
            let stat = factor.statistics[statistic];
            console.log(stat);
            let screen_stat = linearScale(stat, [min_x, max_x], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('factor'+f+statistic, 'line');
            el.setAttr('x1', screen_stat);
            el.setAttr('y1', factor_bounds.bottom);
            el.setAttr('x2', screen_stat);
            el.setAttr('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            new_elements.push(el);
        }
    }
    if(statistic == 'proportion'){
        for(let f = 0; f < num_factors; f++){
            let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
            let factor = elements.factors[f];
            let stat = factor.statistics[statistic];
            console.log(stat);
            let screen_stat = linearScale(stat, [0, 1], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('factor'+f+statistic, 'line');
            el.setAttr('x1', screen_stat);
            el.setAttr('y1', factor_bounds.bottom);
            el.setAttr('x2', screen_stat);
            el.setAttr('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            new_elements.push(el);
        }
    }
    if(statistic == "Average Deviation" || statistic == "F Stat"){
        console.log(statistic + elements.all.statistics[statistic]);
        let pop_stat = elements.all.statistics["Mean"] ? "Mean" : "proportion";
        console.log("Mean" + elements.all.statistics[pop_stat]);
        
        let max_x = elements.all.statistics["Mean"] ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] > a ? c.attrs[dimensions[0].name] : a, -100000) : 1;
        let min_x = elements.all.statistics["Mean"] ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] < a ? c.attrs[dimensions[0].name] : a, 1000000) : 0;
        for(let f = 0; f < num_factors; f++){
            let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
            let factor = elements.factors[f];
            let stat = factor.statistics[pop_stat];
            console.log(stat);
            let screen_stat = linearScale(stat, [min_x, max_x], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('factor'+f+statistic, 'line');
            el.setAttr('x1', screen_stat);
            el.setAttr('y1', factor_bounds.bottom);
            el.setAttr('x2', screen_stat);
            el.setAttr('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            new_elements.push(el);
        }
        let stat = elements.all.statistics[statistic];
        console.log(stat);
        let screen_stat = linearScale(stat, [min_x, max_x], [bounds.innerLeft, bounds.innerRight]);
        let el = new visElement('overall'+statistic, 'line');
        el.setAttr('x1', screen_stat);
        el.setAttr('y1', bounds.top);
        el.setAttr('x2', screen_stat);
        el.setAttr('y2', bounds.bottom);
        new_elements.push(el);
    }
    if(statistic == "Slope"){
        let slope = elements.all.statistics["Slope"];
        let intercept = elements.all.statistics["Intercept"];
        let max_x = elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] > a ? c.attrs[dimensions[0].name] : a, -100000);
        let min_x = elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] < a ? c.attrs[dimensions[0].name] : a, 1000000);
        let max_y = elements.all.reduce((a, c)=> c.attrs[dimensions[1].name] > a ? c.attrs[dimensions[1].name] : a, -100000);
        let min_y = elements.all.reduce((a, c)=> c.attrs[dimensions[1].name] < a ? c.attrs[dimensions[1].name] : a, 1000000);
        let x1 = bounds.innerLeft;
        let x2 = bounds.innerRight;
        let y1 = linearScale(min_x * slope + intercept, [min_y, max_y], [bounds.bottom, bounds.top]);
        let y2 = linearScale(max_x * slope + intercept, [min_y, max_y], [bounds.bottom, bounds.top]);
        let el = new visElement('overall'+statistic, 'line');
        el.setAttr('x1', x1);
        el.setAttr('y1', y1);
        el.setAttr('x2', x2);
        el.setAttr('y2', y2);
        new_elements.push(el);

    }

    return new_elements;
}

function placeElements(elements, dimensions, bounds, options){
    let num_factors = elements.factors.length;
    for(let f = 0; f < num_factors; f++){
        let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
        if(dimensions[0].type == 'numeric'){
            if(dimensions.length < 2 || dimensions[1].type == 'categoric'){
                heap(elements.factors[f], factor_bounds);
                console.log(elements);
            }else if(dimensions[1].type == 'numeric'){
                let max_x = elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] > a ? c.attrs[dimensions[0].name] : a, -100000);
                let min_x = elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] < a ? c.attrs[dimensions[0].name] : a, 1000000);
                let max_y = elements.all.reduce((a, c)=> c.attrs[dimensions[1].name] > a ? c.attrs[dimensions[1].name] : a, -100000);
                let min_y = elements.all.reduce((a, c)=> c.attrs[dimensions[1].name] < a ? c.attrs[dimensions[1].name] : a, 1000000);
                for(let i = 0; i < elements.all.length; i++){
                    let element = elements.all[i];
                    let screen_x = linearScale(element.attrs[dimensions[0].name], [min_x, max_x], [bounds.left, bounds.right] );
                    let screen_y = linearScale(element.attrs[dimensions[1].name], [min_y, max_y], [bounds.bottom, bounds.top] );
                    element.setAttr('x', screen_x);
                    element.setAttr('y', screen_y);
                    element.setAttr('init_x', screen_x);
                    element.setAttr('init_y', screen_y);
                }
            }


        }else{
            let sum = 0;
            let height = (factor_bounds.bottom - factor_bounds.top) / 2;
            let mid_y = ( height) + factor_bounds.top;
            let prop_items = elements.factors[f].filter((e) => e.type=='prop');
            let text_items = elements.factors[f].filter((e) => e.type=='text');
            for(let e = 0; e < prop_items.length; e++){
                let prop_rect = prop_items[e];
                let width = linearScale(prop_rect.getAttr('prop'), [0, 1], [0, factor_bounds.right - factor_bounds.left]);
                prop_rect.setAttr('y', mid_y - height/2);
                prop_rect.setAttr('x', factor_bounds.left + sum);
                prop_rect.setAttr('width', width);
                prop_rect.setAttr('height', height);
                prop_rect.setAttr('init_y', mid_y - height/2);
                prop_rect.setAttr('init_x', factor_bounds.left + sum);
                prop_rect.setAttr('init_width', width);
                prop_rect.setAttr('init_height', height);

                let text_item = text_items[e];
                text_item.setAttr('y', mid_y - height/2);
                text_item.setAttr('x', factor_bounds.left + sum);
                text_item.setAttr('baseline', 'alphabetic');
                text_item.setAttr('align', 'start');
                text_item.setAttr('init_x', mid_y - height/2);
                text_item.setAttr('init_y', factor_bounds.left + sum);
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
    for(let d = 0; d < elements.length; d++){
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
            buckets[b][e].setAttr('init_x', linearScale(buckets[b][e].value, [min, max], [bounds.left, bounds.right]))
            buckets[b][e].setAttr('init_y', bounds.bottom - spacePerElement * e)
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