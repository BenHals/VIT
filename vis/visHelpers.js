function elementsFromDataset(dataset, dimensions, bounds, options){
    let statistic = options["Statistic"];
    let elements = {all:[], factors:[]};
    let num_factors = !dimensions.has_factors ? 1 : dimensions[1].factors.length;
    for(let i = 0; i < num_factors; i++){
        elements.factors.push([]);
    }
    if(dimensions[0].type == 'numeric'){
        for(let i in dataset.all){
            let datapoint = dataset.all[i];
            let y_factor = !dimensions.has_factors ? "" : datapoint[dimensions[1].name];
            let y_factor_index = !dimensions.has_factors ? 0 : dimensions[1].factors.indexOf(y_factor);
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
            let stat = !dimensions.has_factors ? dataset.statistics : dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[f]].statistics;
            elements.factors[f].statistics = stat;
        }
    }else{
        if(dimensions.length >= 2){
            for(let i in dimensions[1].factors){
                let y_factor = dimensions[1].factors[i];
                let y_factor_ds = dataset[dimensions[1].name]["own"+y_factor];
                let y_factor_prop = y_factor_ds.statistics.proportion;
                let y_items = y_factor_ds.all.length;
                for(let n = 0; n < 2; n++){
                    let x_factor = n == 0 ? dimensions[0].focus : dimensions[0].factors.length == 2 ? dimensions[0].factors[1 - dimensions[0].factors.indexOf(dimensions[0].focus)] : "Other";
                    let actual_prop = x_factor == dimensions[0].focus ? y_factor_prop : (1-y_factor_prop);
                    let total_items = actual_prop * y_items;
                    createPropBar(parseInt(i) * parseInt(n) + parseInt(n),
                    actual_prop,
                    y_factor,
                    x_factor,
                    elements.all,
                    elements.factors[dimensions[1].factors.indexOf(y_factor)],
                    dimensions[0].focus,
                    total_items);
                    
                }
                elements.factors[dimensions[1].factors.indexOf(y_factor)].statistics = y_factor_ds.statistics;
            }
        }else{
            let y_factor_prop = dataset.statistics.proportion;
            let y_items = dataset.all.length;
            for(let n = 0; n < 2; n++){
                let x_factor = n == 0 ? dimensions[0].focus : dimensions[0].factors.length == 2 ? dimensions[0].factors[1 - dimensions[0].factors.indexOf(dimensions[0].focus)] : "Other";
                let actual_prop = x_factor == dimensions[0].focus ? y_factor_prop : (1-y_factor_prop);
                let total_items = actual_prop * y_items;
                createPropBar(parseInt(n),
                actual_prop,
                '',
                x_factor,
                elements.all,
                elements.factors[0],
                dimensions[0].focus,
                total_items);
            }
            elements.factors[0].statistics = dataset.statistics;
        }
        elements.all.statistics = dataset.statistics;
    }
    return elements;

}


function createPropBar(id, prop, y, x, all_list, factor_list, focus, total_items){
    let el = new visElement(id, 'prop');
    el.setAttr('prop', prop);
    el.setAttr('factorY', y);
    el.setAttr('factorX', x);
    el.setAttr('text', x);
    el.setAttr('selected', x == focus);
    el.setAttrInit('items', total_items);
    all_list.push(el);
    if(x == focus){
        factor_list.unshift(el);
    }else{
        factor_list.push(el);
    }

    // create prop bar circles
    for(let e = 0; e < total_items; e++){
        let el = new visElement(id, 'datapoint');
        el.setAttr('prop', prop);
        el.setAttr('text', x);
        all_list.push(el);
    }



    // el = new visElement(id+'text', 'prop-text');
    // el.setAttr('text', x);
    // el.setAttrInit('y', y);
    // el.setAttrInit('x', x);
    // el.setAttr('selected', x == focus);
    // all_list.push(el);
    // if(x == focus){
    //     factor_list.unshift(el);
    // }else{
    //     factor_list.push(el);
    // }
}

function axisFromDataset(bounds, min, max, vertical, id){
    let el = new visElement(id || 'axis', 'axis');
    el.setAttrInit('x1', bounds.innerLeft);
    el.setAttrInit('x2', bounds.innerRight);
    el.setAttrInit('y1', bounds.innerTop);
    el.setAttrInit('y2', bounds.innerBottom);
    el.setAttrInit('min', min);
    el.setAttrInit('max', max);
    el.setAttr('vertical', vertical || false);
    el.setAttrInit('step', tickStep(min, max, 10));
    return el;
}

function labelsFromDimensions(dimensions, bounds, options){
    let factor_labels = dimensions.length > 1 ? dimensions[1].factors : [""];
    let num_factors = factor_labels.length;
    
    let label_elements = factor_labels.map((label, i)=>{
        let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, i)[1], bottom: bounds.split(num_factors, i+1)[1]};
        let el = new visElement(`factor${i}Label`, 'text');
        el.setAttr('text', label);
        el.setAttrInit('x', factor_bounds.right);
        el.setAttrInit('y', factor_bounds.top);
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
        el.setAttrInit('x', factor_bounds.left);
        el.setAttrInit('y', factor_bounds.top);
        el.setAttr('baseline', 'hanging');
        el.setAttr('align', 'start');
        return el;
    });
    return label_elements
}

function statisticsFromElements(elements, dimensions, bounds, options, dataset, min, max){
    let new_elements = [];
    let statistic = options.Statistic;
    let num_factors = elements.factors.length;
    if(statistic == 'Mean' || statistic == 'Median'){
        let max_x = max == undefined ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] > a ? c.attrs[dimensions[0].name] : a, -100000) : max;
        let min_x = min == undefined ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] < a ? c.attrs[dimensions[0].name] : a, 1000000) : min;
        for(let f = 0; f < num_factors; f++){
            let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
            let factor = elements.factors[f];
            let stat = factor.statistics[statistic];
            console.log(stat);
            let screen_stat = linearScale(stat, [min_x, max_x], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('factor'+f+statistic, 'line');
            el.setAttrInit('x1', screen_stat);
            el.setAttrInit('y1', factor_bounds.bottom);
            el.setAttrInit('x2', screen_stat);
            el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            el.setAttrInit('stat', stat);
            new_elements.push(el);
        }
        if(num_factors == 2){
            let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, 0)[1], bottom: bounds.split(num_factors, 1)[1]};
            let factor_1 = elements.factors[0];
            let factor_stat_1 = factor_1.statistics[statistic];
            let factor_2 = elements.factors[1];
            let factor_stat_2 = factor_2.statistics[statistic];
            let screen_factor_stat_1 = linearScale(factor_stat_1, [min, max], [factor_bounds.left, factor_bounds.right]);
            let screen_factor_stat_2 = linearScale(factor_stat_2, [min, max], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('dist_stat_arrow_diff', 'arrow');
            el.setAttrInit('x1', screen_factor_stat_1);
            el.setAttrInit('y1', factor_bounds.bottom + (factor_bounds.bottom - factor_bounds.top)/5);
            el.setAttrInit('x2', screen_factor_stat_2);
            el.setAttrInit('y2', factor_bounds.bottom + (factor_bounds.bottom - factor_bounds.top)/5);
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
            el.setAttrInit('x1', screen_stat);
            el.setAttrInit('y1', factor_bounds.bottom);
            el.setAttrInit('x2', screen_stat);
            el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            new_elements.push(el);
        }
        if(num_factors == 2){
            let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, 0)[1], bottom: bounds.split(num_factors, 1)[1]};
            let factor_1 = elements.factors[0];
            let factor_stat_1 = factor_1.statistics[statistic];
            let factor_2 = elements.factors[1];
            let factor_stat_2 = factor_2.statistics[statistic];
            let screen_factor_stat_1 = linearScale(factor_stat_1, [min, max], [factor_bounds.left, factor_bounds.right]);
            let screen_factor_stat_2 = linearScale(factor_stat_2, [min, max], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('dist_stat_arrow_diff', 'arrow');
            el.setAttrInit('x1', screen_factor_stat_1);
            el.setAttrInit('y1', factor_bounds.bottom + (factor_bounds.bottom - factor_bounds.top)/10);
            el.setAttrInit('x2', screen_factor_stat_2);
            el.setAttrInit('y2', factor_bounds.bottom + (factor_bounds.bottom - factor_bounds.top)/10);
            new_elements.push(el);
        }
    }
    if(statistic == "Average Deviation" || statistic == "F Stat"){
        console.log(statistic + elements.all.statistics[statistic]);
        let pop_stat = elements.all.statistics["Mean"] ? "Mean" : "proportion";
        console.log("Mean" + elements.all.statistics[pop_stat]);
        
        let max_x = max == undefined ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] > a ? c.attrs[dimensions[0].name] : a, -100000) : max;
        let min_x = min == undefined ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] < a ? c.attrs[dimensions[0].name] : a, 1000000) : min;
        let overall_stat = dataset.statistics[pop_stat];
        for(let f = 0; f < num_factors; f++){
            let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
            let factor = elements.factors[f];
            let stat = factor.statistics[pop_stat];
            console.log(stat);
            let screen_stat = linearScale(stat, [min_x, max_x], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('factor'+f+statistic, 'line');
            el.setAttrInit('x1', screen_stat);
            el.setAttrInit('y1', factor_bounds.bottom);
            el.setAttrInit('x2', screen_stat);
            el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            new_elements.push(el);

            
            let screen_overall_stat = linearScale(overall_stat, [min_x, max_x], [factor_bounds.left, factor_bounds.right]);
            let el_diff = new visElement('dist_stat_arrow' + f, 'arrow');
            el_diff.setAttrInit('x1', screen_stat);
            el_diff.setAttrInit('y1', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            el_diff.setAttrInit('x2', screen_overall_stat);
            el_diff.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            new_elements.push(el_diff);

        }
        console.log(overall_stat);
        let screen_stat = linearScale(overall_stat, [min_x, max_x], [bounds.innerLeft, bounds.innerRight]);
        let el = new visElement('overall'+statistic, 'line');
        el.setAttrInit('x1', screen_stat);
        el.setAttrInit('y1', bounds.top);
        el.setAttrInit('x2', screen_stat);
        el.setAttrInit('y2', bounds.bottom);
        new_elements.push(el);

        let deviation = elements.all.statistics[statistic];
        let screen_deviation = linearScale(deviation, [0, (max_x - min_x)], [bounds.innerLeft, bounds.innerRight]);
        el = new visElement('devi_arrow', 'arrow');
        el.setAttrInit('x1', 0);
        el.setAttrInit('y1', -10);
        el.setAttrInit('x2', screen_deviation);
        el.setAttrInit('y2', -10);
        el.setAttr('dev', deviation);
        new_elements.push(el);

    }
    if(statistic == "Slope"){
        let slope = elements.all.statistics["Slope"];
        let intercept = elements.all.statistics["Intercept"];
        let max_x = max == undefined ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] > a ? c.attrs[dimensions[0].name] : a, -100000) : max;
        let min_x = min == undefined ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] < a ? c.attrs[dimensions[0].name] : a, 100000) : min;
        let pop_elements = vis.staticElements || elements;
        let max_y = pop_elements.all.reduce((a, c)=> c.attrs[dimensions[1].name] > a ? c.attrs[dimensions[1].name] : a, -100000);
        let min_y = pop_elements.all.reduce((a, c)=> c.attrs[dimensions[1].name] < a ? c.attrs[dimensions[1].name] : a, 1000000);
        let x1 = bounds.innerLeft;
        let x2 = bounds.innerRight;
        let y1 = linearScale(min_x * slope + intercept, [min_y, max_y], [bounds.bottom, bounds.top]);
        let y2 = linearScale(max_x * slope + intercept, [min_y, max_y], [bounds.bottom, bounds.top]);
        let el = new visElement('overall'+statistic, 'line');
        el.setAttrInit('x1', x1);
        el.setAttrInit('y1', y1);
        el.setAttrInit('x2', x2);
        el.setAttrInit('y2', y2);
        new_elements.push(el);

    }

    return new_elements;
}

function statisticsFromDistribution(distribution_stat, dataset, dimensions, bounds, options, popMin, popMax, min, max, s_i){
    let new_elements = [];
    let statistic = options.Statistic;
    let num_factors = dimensions.length > 1 ? dimensions[1].factors.length : 1;
    if(statistic == 'Mean' || statistic == 'Median'){
        if(num_factors > 0 && num_factors < 2 ){
            for(let f = 0; f < num_factors; f++){
                let stats = dimensions.length < 2 || dimensions[1].type == 'numeric' ? dataset.statistics : dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[f]].statistics;
                let overall_stats = dataset.statistics;
                let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
                let stat = distribution_stat;
                let factor_stat = stats[statistic];
                let overall_stat = overall_stats[statistic]
                let screen_factor_stat = linearScale(factor_stat, [popMin, popMax], [factor_bounds.left, factor_bounds.right]);
                let screen_overall_stat = linearScale(overall_stat, [popMin, popMax], [factor_bounds.left, factor_bounds.right]);
                let screen_stat = linearScale(stat, [popMin, popMax], [factor_bounds.left, factor_bounds.right]);
                let el = new visElement('dist_stat_arrow' + f, 'line');
                el.setAttrInit('x1', screen_stat);
                el.setAttrInit('y1', factor_bounds.bottom);
                el.setAttrInit('x2', screen_stat);
                el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
                el.setAttrInit('stat', distribution_stat);
                new_elements.push(el);
            }    
        }else {
            for(let f = 0; f < num_factors; f++){
                let stats = dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[f]].statistics;
                let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
                let factor_stat = stats[statistic];
                let screen_factor_stat = linearScale(factor_stat, [popMin, popMax], [factor_bounds.left, factor_bounds.right]);
                let el = new visElement('dist_stat_arrow_diff', 'line');
                el.setAttrInit('x1', screen_factor_stat);
                el.setAttrInit('y1', factor_bounds.bottom);
                el.setAttrInit('x2', screen_factor_stat);
                el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
                el.setAttrInit('stat', distribution_stat);
                new_elements.push(el);
            }
        }

    }
    if(statistic == 'proportion'){
        for(let f = 0; f < num_factors; f++){
            let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
            let stat = distribution_stat;
            let screen_stat = linearScale(stat, [0, 1], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('dist_stat_line' + f, 'line');
            el.setAttrInit('x1', screen_stat);
            el.setAttrInit('y1', factor_bounds.bottom);
            el.setAttrInit('x2', screen_stat);
            el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            el.setAttrInit('stat', distribution_stat);
            new_elements.push(el);
        }
    }
    // if(statistic == "Average Deviation" || statistic == "F Stat"){
    //     for(let f = 0; f < num_factors; f++){
    //         let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
    //         let stat = distribution_stat;
    //         let screen_stat = linearScale(stat, [min, max], [factor_bounds.left, factor_bounds.right]);
    //         let el = new visElement('dist_stat_line' + f, 'line');
    //         el.setAttr('x1', screen_stat);
    //         el.setAttr('y1', factor_bounds.bottom);
    //         el.setAttr('x2', screen_stat);
    //         el.setAttr('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
    //         new_elements.push(el);
    //     }
    // }
    if(statistic == "Slope"){
        let slope = distribution_stat;
        let x1 = bounds.innerLeft;
        let x2 = bounds.innerRight;
        let y1 = linearScale(0, [min, max], [bounds.bottom, bounds.top]);
        let y2 = linearScale(slope, [min, max], [bounds.bottom, bounds.top]);
        let el = new visElement('dist_stat_lineline', 'line');
        el.setAttrInit('x1', x1);
        el.setAttrInit('y1', y1);
        el.setAttrInit('x2', x2);
        el.setAttrInit('y2', y2);
        if(s_i == 4)console.log('stat', slope, min, max, bounds.bottom, bounds.top);
        el.value = slope;
        new_elements.push(el);

    }

    return new_elements;
}
function elementsFromDistribution(distribution, datasets, dimensions, bounds, options, popMin, popMax, min, max, inCI, population_statistic){
    let distribution_elements = [];
    let distribution_stat_elements = [];
    let distribution_CI_elements = [];
    for(let i = 0; i < distribution.length; i++){
        let el = new visElement(i, 'distribution');
        el.setAttr('stat', options.Statistic);
        el.value = distribution[i];
        let dist_distance_from_pop = distribution.slice().sort(function(a, b){return Math.abs(a - population_statistic) - Math.abs(b-population_statistic)});
        let in_ci = inCI(dist_distance_from_pop, distribution[i], population_statistic);
        el.setAttr('in_ci', in_ci);
        distribution_elements.push(el);
        let dist_stat_els = statisticsFromDistribution(distribution[i], datasets[i], dimensions, bounds, options, popMin, popMax, min, max, i);
        distribution_stat_elements.push(dist_stat_els);
    }
    let cross_bar = new visElement('ci_cross_bar', 'line');
    cross_bar.setAttr('selected', 1);
    let ci_min = new visElement('ci_min', 'down-arrow');
    let ci_max = new visElement('ci_max', 'down-arrow');
    distribution_CI_elements = [cross_bar, ci_min, ci_max];
    return [distribution_elements, distribution_stat_elements, distribution_CI_elements];
}

function placeElements(elements, dimensions, bounds, options, min, max){
    console.log(bounds.width, bounds.left, min, max);
    let num_factors = elements.factors.length;
    let max_x = max == undefined ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] > a ? c.attrs[dimensions[0].name] : a, -100000) : max;
    let min_x = min == undefined ? elements.all.reduce((a, c)=> c.attrs[dimensions[0].name] < a ? c.attrs[dimensions[0].name] : a, 100000) : min;
    for(let f = 0; f < num_factors; f++){
        let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
        if(dimensions[0].type == 'numeric'){
            if(dimensions.length < 2 || dimensions[1].type == 'categoric'){
                heap(elements.factors[f], factor_bounds, min_x, max_x);
                console.log(elements);
            }else if(dimensions[1].type == 'numeric'){
                let pop_elements = vis.staticElements || elements;
                let max_y = pop_elements.all.reduce((a, c)=> c.attrs[dimensions[1].name] > a ? c.attrs[dimensions[1].name] : a, -100000);
                let min_y = pop_elements.all.reduce((a, c)=> c.attrs[dimensions[1].name] < a ? c.attrs[dimensions[1].name] : a, 1000000);
                for(let i = 0; i < elements.all.length; i++){
                    let element = elements.all[i];
                    let screen_x = linearScale(element.attrs[dimensions[0].name], [min_x, max_x], [bounds.left, bounds.right] );
                    let screen_y = linearScale(element.attrs[dimensions[1].name], [min_y, max_y], [bounds.bottom, bounds.top] );
                    element.setAttrInit('x', screen_x);
                    element.setAttrInit('y', screen_y);
                }
            }
        }else{
            let sum = 0;
            let height = (factor_bounds.bottom - factor_bounds.top) / 2;
            let mid_y = ( height) + factor_bounds.top;
            let prop_items = elements.factors[f].filter((e) => e.type=='prop');
            let text_items = elements.factors[f].filter((e) => e.type=='prop-text');
            for(let e = 0; e < prop_items.length; e++){
                let prop_rect = prop_items[e];
                let width = linearScale(prop_rect.getAttr('prop'), [0, 1], [0, factor_bounds.right - factor_bounds.left]);
                prop_rect.setAttrInit('y', mid_y - height/2);
                prop_rect.setAttrInit('x', factor_bounds.left + sum);
                prop_rect.setAttrInit('width', width);
                prop_rect.setAttrInit('height', height);

                // let text_item = text_items[e];
                // text_item.setAttrInit('y', mid_y - height/2);
                // text_item.setAttrInit('x', factor_bounds.left + sum);
                // text_item.setAttr('baseline', 'alphabetic');
                // text_item.setAttr('align', 'start');
                sum += width;
            }
            console.log(sum);
        }
        
    }

}
function placeCI(ci, area, min, max, dimensions){

}
function placeDistribution(datapoints, ci, area, vertical, min, max){
    if(! vertical){
        heap(datapoints, area, min, max, false, 5);
    }else{
        heap(datapoints, area, min, max, true, 5);
    }
    let min_ci_screen_x = null;
    let max_ci_screen_x = null;
    let min_ci_screen_y = null;
    let max_ci_screen_y = null;
    for(let i = 0; i < datapoints.length; i++){
        let dp = datapoints[i];
        if(dp.getAttr('in_ci') == 0) continue;
        min_ci_screen_x = min_ci_screen_x == null || dp.getAttr('x') < min_ci_screen_x ? dp.getAttr('x') : min_ci_screen_x;
        max_ci_screen_x = max_ci_screen_x == null || dp.getAttr('x') > max_ci_screen_x ? dp.getAttr('x') : max_ci_screen_x;
        min_ci_screen_y = min_ci_screen_y == null || dp.getAttr('y') < min_ci_screen_y ? dp.getAttr('y') : min_ci_screen_y;
        max_ci_screen_y = max_ci_screen_y == null || dp.getAttr('y') > max_ci_screen_y ? dp.getAttr('y') : max_ci_screen_y;
    }
    let [cross_bar, ci_min, ci_max] = ci;
    if(!vertical){
        cross_bar.setAttr('x1', min_ci_screen_x);
        cross_bar.setAttr('x2', max_ci_screen_x);
        cross_bar.setAttr('y1', area.split(2, 1)[1]);
        cross_bar.setAttr('y2', area.split(2, 1)[1]);
        ci_min.setAttr('x1', min_ci_screen_x);
        ci_min.setAttr('x2', min_ci_screen_x);
        ci_min.setAttr('y1', area.split(2, 1)[1]);
        ci_min.setAttr('y2', area.split(2, 2)[1]);
        ci_max.setAttr('x1', max_ci_screen_x);
        ci_max.setAttr('x2', max_ci_screen_x);
        ci_max.setAttr('y1', area.split(2, 1)[1]);
        ci_max.setAttr('y2', area.split(2, 2)[1]);
    }else{
        cross_bar.setAttr('y1', min_ci_screen_y);
        cross_bar.setAttr('y2', max_ci_screen_y);
        cross_bar.setAttr('x1', max_ci_screen_x);
        cross_bar.setAttr('x2', max_ci_screen_x);
        ci_min.setAttr('y1', min_ci_screen_y);
        ci_min.setAttr('y2', min_ci_screen_y);
        ci_min.setAttr('x1', max_ci_screen_x);
        ci_min.setAttr('x2', min_ci_screen_x);
        ci_max.setAttr('y1', max_ci_screen_y);
        ci_max.setAttr('y2', max_ci_screen_y);
        ci_max.setAttr('x1', max_ci_screen_x);
        ci_max.setAttr('x2', min_ci_screen_x);
        ci_min.type = "arrow";
        ci_min.setAttr('selected', 1);
        ci_max.type = "arrow";
        ci_max.setAttr('selected', 1);
    }


    
}

function getPopulationStatistic(dataset, statistic, dimensions){
    if(dimensions.length > 1 && dimensions[1].factors.length == 2){
        let f0_stat = dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[0]].statistics[statistic];
        let f1_stat = dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[1]].statistics[statistic];
        return f1_stat - f0_stat;
    }
    return dataset.statistics[statistic];
}
function linearScale(value, domain, range){
    let proportion = (value - domain[0]) / (domain[1] - domain[0]);
    return proportion * (range[1] - range[0]) + range[0];
}

function heap(elements, bounds, min, max, vertical, base_margin){
    
    let numBuckets = 300;
    let buckets = {};
    let tallestBucketHeight = 0;
    let max_v = max == undefined ? elements.reduce((a, c)=> c.value > a ? c.value : a, -100000) : max;
    let min_v = min == undefined ? elements.reduce((a, c)=> c.value < a ? c.value : a, 1000000) : min;
    let screen_range = !vertical ? [bounds.left, bounds.right] : [bounds.bottom, bounds.top];
    let screen_range_vert = !vertical ? [bounds.bottom, bounds.top] : [bounds.left, bounds.right];
    for(let d = 0; d < elements.length; d++){
        let datapoint = elements[d];
        let screen_x = linearScale(datapoint.value, [min_v, max_v], screen_range);
        let bucket = Math.floor(linearScale(screen_x, screen_range, [0, numBuckets] ));
        if(!(bucket in buckets)) buckets[bucket] = [];
        buckets[bucket].push(datapoint);
        if(buckets[bucket].length > tallestBucketHeight) tallestBucketHeight = buckets[bucket].length;
    }
    var spaceAvaliable = Math.abs(screen_range_vert[0] - screen_range_vert[1]);
    let base_margin_value = base_margin || Math.abs(bounds.bottom - bounds.top)/4
    var spacePerElement = Math.min(spaceAvaliable/tallestBucketHeight, 5);
    for(var b in buckets){
        for(var e in buckets[b]){
            if(!vertical){
                buckets[b][e].setAttrInit('x', linearScale(buckets[b][e].value, [min_v, max_v], screen_range))
                buckets[b][e].setAttrInit('y', bounds.bottom  - base_margin_value - spacePerElement * e)
            }else{
                buckets[b][e].setAttrInit('y', linearScale(buckets[b][e].value, [min_v, max_v], screen_range))
                buckets[b][e].setAttrInit('x', bounds.left + base_margin_value  + spacePerElement * e )
                if(buckets[b][e].id == 4) console.log('point', buckets[b][e].value, min_v, max_v, screen_range[0], screen_range[1]);
            }

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
    areas["sec2regL"+"display"] = new Area(sec_bounds.left, seventy, sec_bounds.top, sec_bounds.bottom);
    areas["sec2regL"+"axis"] = new Area(sec_bounds.left, seventy, ninty, sec_bounds.bottom);

    areas["sec2regR"] = new Area(seventy, sec_bounds.right, sec_bounds.top, sec_bounds.bottom);
    ten = areas["sec2regR"].split(10, 1)[0];
    ninty = areas["sec2regR"].split(10, 9)[0];
    areas["sec2regR"+"title"] = new Area(ninty, sec_bounds.right, sec_bounds.top, sec_bounds.bottom);
    
    areas["sec2regR"+"display"] = new Area(ten, ninty, sec_bounds.top, sec_bounds.bottom);
    areas["sec2regR"+"axis"] = new Area(seventy, ten, sec_bounds.top, sec_bounds.bottom);

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

// FROM d3-array
// https://github.com/d3/d3-array/blob/master/src/ticks.js
function tickIncrement(start, stop, count) {
    var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
    var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
}