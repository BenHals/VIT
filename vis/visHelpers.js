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
            if(num_factors > 1){
                el.setAttrInit('stroke-color', d3.color(config.groupColorsList[y_factor_index]).darker());
                el.setAttrInit('fill-color', d3.color(config.groupColorsList[y_factor_index]));
            }
            
            el.value = datapoint[dimensions[0].name];
            elements.all.push(el);
            if(!elements.factors[y_factor_index]){
                console.log(y_factor_index);
                console.log(y_factor);
            }
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
    for(let e = 0; e < Math.round(total_items); e++){
        let el = new visElement(id, 'datapoint');
        el.setAttr('prop', prop);
        el.setAttr('text', x);
        el.setAttr('factorX', x);
        el.setAttr('factorY', y);
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
        el.setAttrInit('fill-color', config.groupColorsList[i]);
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

function statisticsFromElements(elements, dimensions, bounds, options, dataset, min, max, areas){
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
            let median = linearScale(factor.statistics['Median'], [min_x, max_x], [factor_bounds.left, factor_bounds.right]);
            let lq = linearScale(factor.statistics['lq'], [min_x, max_x], [factor_bounds.left, factor_bounds.right]);
            let uq = linearScale(factor.statistics['uq'], [min_x, max_x], [factor_bounds.left, factor_bounds.right]);
            let el = new visElement('factor'+f+statistic, 'line');
            el.setAttrInit('x1', screen_stat);
            el.setAttrInit('y1', factor_bounds.bottom);
            el.setAttrInit('x2', screen_stat);
            el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
            el.setAttrInit('stat', stat);
            new_elements.push(el);
            if(areas && num_factors == 1){
                el = new visElement('factor_dotted'+f+statistic, 'line');
                el.setAttrInit('x1', screen_stat);
                el.setAttrInit('y1', areas.overall.bottom);
                el.setAttrInit('x2', screen_stat);
                el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
                el.setAttrInit('stat', stat);
                el.setAttrInit('dashed', true);
                el.setAttrInit('stroke-opacity', 0.4);
                new_elements.push(el);
                el = new visElement('factor_text'+f+statistic, 'text');
                el.setAttrInit('x', screen_stat);
                el.setAttrInit('y', factor_bounds.bottom);
                el.setAttrInit('text', Math.round(stat * 100) / 100 );
                el.setAttrInit('dashed', true);
                el.setAttrInit('stroke-opacity', 0.4);
                new_elements.push(el);

                let boxplottop = factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/4 + 13;
                let boxplotbottom = factor_bounds.bottom;
                el = new visElement('factor'+f+'median', 'line');
                el.setAttrInit('x1', median);
                el.setAttrInit('y1', boxplotbottom);
                el.setAttrInit('x2', median);
                el.setAttrInit('y2', boxplottop);
                el.setAttrInit('stat', median);
                el.setAttrInit('stroke-opacity', 0.2);
                new_elements.push(el); 
                el = new visElement('factor'+f+'lq', 'line');
                el.setAttrInit('x1', lq);
                el.setAttrInit('y1', boxplotbottom);
                el.setAttrInit('x2', lq);
                el.setAttrInit('y2', boxplottop);
                el.setAttrInit('stat', lq);
                el.setAttrInit('stroke-opacity', 0.2);
                new_elements.push(el); 
                el = new visElement('factor'+f+'uq', 'line');
                el.setAttrInit('x1', uq);
                el.setAttrInit('y1', boxplotbottom);
                el.setAttrInit('x2', uq);
                el.setAttrInit('y2', boxplottop);
                el.setAttrInit('stat', uq);
                el.setAttrInit('stroke-opacity', 0.2);
                new_elements.push(el); 
                el = new visElement('factor'+f+'boxtop', 'line');
                el.setAttrInit('x1', lq);
                el.setAttrInit('y1', boxplottop);
                el.setAttrInit('x2', uq);
                el.setAttrInit('y2', boxplottop);
                el.setAttrInit('stat', uq);
                el.setAttrInit('stroke-opacity', 0.2);
                new_elements.push(el); 
                el = new visElement('factor'+f+'boxbot', 'line');
                el.setAttrInit('x1', lq);
                el.setAttrInit('y1', boxplotbottom);
                el.setAttrInit('x2', uq);
                el.setAttrInit('y2', boxplotbottom);
                el.setAttrInit('stat', uq);
                el.setAttrInit('stroke-opacity', 0.2);
                new_elements.push(el); 
            }
            
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
            if(areas && num_factors == 1){
                el = new visElement('factor_dotted'+f+statistic, 'line');
                el.setAttrInit('x1', screen_stat);
                el.setAttrInit('y1', areas.overall.bottom);
                el.setAttrInit('x2', screen_stat);
                el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
                el.setAttrInit('stat', stat);
                el.setAttrInit('dashed', true);
                el.setAttrInit('stroke-opacity', 0.4);
                new_elements.push(el);
            }
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

function statisticsFromDistribution(distribution_item, dataset, dimensions, bounds, options, popMin, popMax, min, max, s_i){
    let new_elements = [];
    let statistic = options.Statistic;
    let num_factors = dimensions.length > 1 ? dimensions[1].factors.length : 1;
    let distribution_stat = distribution_item.point_value;
    let ci_range = distribution_item.CI_range;
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
                let el = new visElement('dist_stat_line' + f, 'line');
                el.setAttrInit('x1', screen_stat);
                el.setAttrInit('y1', factor_bounds.bottom);
                el.setAttrInit('x2', screen_stat);
                el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
                el.setAttrInit('stat', distribution_stat);
                new_elements.push(el);
                if(ci_range){
                    let el = new visElement('dist_stat_range' + f, 'line');
                    el.setAttrInit('x1', linearScale(ci_range[0], [popMin, popMax], [factor_bounds.left, factor_bounds.right]));
                    el.setAttrInit('y1', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/8);
                    el.setAttrInit('x2', linearScale(ci_range[1], [popMin, popMax], [factor_bounds.left, factor_bounds.right]));
                    el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/8);
                    el.setAttrInit('stat', distribution_stat);
                    new_elements.push(el); 
                    el = new visElement('dist_stat_stay' + f, 'line');
                    el.setAttrInit('x1', linearScale(ci_range[0], [popMin, popMax], [factor_bounds.left, factor_bounds.right]));
                    el.setAttrInit('y1', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/8);
                    el.setAttrInit('x2', linearScale(ci_range[1], [popMin, popMax], [factor_bounds.left, factor_bounds.right]));
                    el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/8);
                    el.setAttrInit('stat', distribution_stat);
                    new_elements.push(el); 
                }
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
        if(num_factors > 0 && num_factors < 2 ){
            for(let f = 0; f < num_factors; f++){
                let stats = dataset.statistics;
                let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
                let factor_stat = stats[statistic];
                let screen_factor_stat = linearScale(factor_stat, [popMin, popMax], [factor_bounds.left, factor_bounds.right]);
                let el = new visElement('dist_stat_line' + f, 'line');
                el.setAttrInit('x1', screen_factor_stat);
                el.setAttrInit('y1', factor_bounds.bottom);
                el.setAttrInit('x2', screen_factor_stat);
                el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
                el.setAttrInit('stat', distribution_stat);
                new_elements.push(el);
                if(ci_range){
                    let el = new visElement('dist_stat_range' + f, 'line');
                    el.setAttrInit('x1', linearScale(ci_range[0], [popMin, popMax], [factor_bounds.left, factor_bounds.right]));
                    el.setAttrInit('y1', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/8);
                    el.setAttrInit('x2', linearScale(ci_range[1], [popMin, popMax], [factor_bounds.left, factor_bounds.right]));
                    el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/8);
                    el.setAttrInit('stat', distribution_stat);
                    new_elements.push(el); 
                    el = new visElement('dist_stat_stay' + f, 'line');
                    el.setAttrInit('x1', linearScale(ci_range[0], [popMin, popMax], [factor_bounds.left, factor_bounds.right]));
                    el.setAttrInit('y1', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/8);
                    el.setAttrInit('x2', linearScale(ci_range[1], [popMin, popMax], [factor_bounds.left, factor_bounds.right]));
                    el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/8);
                    el.setAttrInit('stat', distribution_stat);
                    new_elements.push(el); 
                }
            }
        }else{
            for(let f = 0; f < num_factors; f++){
                let stats = dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[f]].statistics;
                let factor_bounds = {left:bounds.innerLeft, right: bounds.innerRight, top:bounds.split(num_factors, f)[1], bottom: bounds.split(num_factors, f+1)[1]};
                let factor_stat = stats[statistic];
                let screen_factor_stat = linearScale(factor_stat, [popMin, popMax], [factor_bounds.left, factor_bounds.right]);
                let el = new visElement('dist_stat_line' + f, 'line');
                el.setAttrInit('x1', screen_factor_stat);
                el.setAttrInit('y1', factor_bounds.bottom);
                el.setAttrInit('x2', screen_factor_stat);
                el.setAttrInit('y2', factor_bounds.bottom - (factor_bounds.bottom - factor_bounds.top)/2);
                el.setAttrInit('stat', distribution_stat);
                new_elements.push(el);
            }
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
function elementsFromDistribution(distribution, datasets, dimensions, bounds, options, popMin, popMax, min, max, inCI, population_statistic, largeCI = [0, 0, 0]){
    let distribution_elements = [];
    let distribution_stat_elements = [];
    let distribution_CI_elements = [];
    let distribution_extra = [];
    let min_in_CI = null;
    let max_in_CI = null;
    let pop_stat_value = population_statistic[0];
    let in_ci_count = 0;
    for(let i = 0; i < distribution.length; i++){
        let el = new visElement(i, 'distribution');
        if(distribution[i].CI_range){
            el = new visElement(i, 'distribution_range');
            el.setAttrInit("range", distribution[i].CI_range);
            el.setAttrInit("ci_min", linearScale(distribution[i].CI_range[0], [min, max], [bounds.left, bounds.right]));
            el.setAttrInit("ci_max", linearScale(distribution[i].CI_range[1], [min, max], [bounds.left, bounds.right]));
        }
        el.setAttr('stat', options.Statistic);
        el.value = distribution[i].point_value;
        let dist_distance_from_pop = distribution.slice().sort(function(a, b){return Math.abs(a.point_value - pop_stat_value) - Math.abs(b.point_value - pop_stat_value)});
        let in_ci = inCI(dist_distance_from_pop, distribution[i], pop_stat_value);
        if(in_ci) in_ci_count++;
        el.setAttr('in_ci', in_ci);
        if(in_ci && (min_in_CI == null || el.value < min_in_CI)) min_in_CI = el.value;
        if(in_ci && (max_in_CI == null || el.value > max_in_CI)) max_in_CI = el.value;
        distribution_elements.push(el);
        let dist_stat_els = statisticsFromDistribution(distribution[i], datasets[i], dimensions, bounds, options, popMin, popMax, min, max, i);
        distribution_stat_elements.push(dist_stat_els);
    }
    if(distribution[0].CI_range){
        let el = new visElement("range_textbox", "dist_textbox");
        el.setAttrInit('x', vis.areas['sec2display'].split(10, 1)[0]);
        el.setAttrInit('y', vis.areas['sec2display'].split(2, 1)[1]);
        el.setAttrInit('text', "0 / 0");
        el.setAttrInit('percentage-text', "0%");
        distribution_extra.push(el);
    }
    let cross_bar = new visElement('ci_cross_bar', 'line');
    cross_bar.setAttr('selected', 1);
    let cross_bar_mid = new visElement('ci_cross_bar_mid', 'line');
    cross_bar_mid.setAttr('selected', 1);
    let cross_bar_top = new visElement('ci_cross_bar_top', 'line');
    cross_bar_top.setAttr('selected', 1);
    let ci_min = new visElement('ci_min', 'down-arrow');
    let ci_max = new visElement('ci_max', 'down-arrow');
    let ci_min_text = new visElement('ci_min_text', 'text');
    let ci_max_text = new visElement('ci_max_text', 'text');
    let ci_min_top = new visElement('ci_min_top', 'down-arrow');
    let ci_max_top = new visElement('ci_max_top', 'down-arrow');
    let ci_min_text_top = new visElement('ci_min_text_top', 'text');
    let ci_max_text_top = new visElement('ci_max_text_top', 'text');
    ci_min_text.setAttr('actual_value', min_in_CI);
    ci_max_text.setAttr('actual_value', max_in_CI);
    let ci_pop_stat_arrow = new visElement('ci_pop_stat_arrow', 'arrow');
    let ci_pop_stat_text = new visElement('ci_pop_stat_text', 'text');
    let ci_num_text = new visElement('ci_num_text', 'text');
    let ci_num_line = new visElement('ci_num_line', 'line');
    if(population_statistic.length > 1){
        ci_pop_stat_arrow.setAttrInit('x1', linearScale(population_statistic[1], [popMin, popMax], [bounds.left, bounds.right]));
        ci_pop_stat_arrow.setAttrInit('dist_x1', linearScale(0, [min, max], [bounds.left, bounds.right]));
        ci_pop_stat_arrow.setAttrInit('x2', linearScale(population_statistic[2], [popMin, popMax], [bounds.left, bounds.right]));
        ci_pop_stat_arrow.setAttrInit('dist_x2', linearScale(pop_stat_value, [min, max], [bounds.left, bounds.right]));
        ci_pop_stat_text.setAttrInit('x', linearScale((population_statistic[2] + population_statistic[1]) / 2, [popMin, popMax], [bounds.left, bounds.right]));
        ci_pop_stat_text.setAttrInit('dist_x', linearScale((pop_stat_value) / 2, [min, max], [bounds.left, bounds.right]));
        ci_pop_stat_text.setAttrInit('text', Math.round(pop_stat_value * 100) / 100);
        
        ci_num_line.setAttrInit('x1', linearScale(pop_stat_value, [min, max], [bounds.left, bounds.right]));
        ci_num_line.setAttrInit('x2', linearScale(pop_stat_value, [min, max], [bounds.left, bounds.right]));
        ci_num_line.setAttrInit('large_x1', linearScale(largeCI[0], [min, max], [bounds.left, bounds.right]));
        ci_num_line.setAttrInit('large_x2', linearScale(largeCI[0], [min, max], [bounds.left, bounds.right]));
        ci_num_text.setAttrInit('x', linearScale(pop_stat_value, [min, max], [bounds.left, bounds.right]));
        ci_num_text.setAttrInit('text', `${in_ci_count} / ${distribution.length}
        = ${Math.round(in_ci_count / distribution.length * 100) / 100}`);
        if(largeCI){
            ci_num_text.setAttrInit('large_text', `${largeCI[2]} / ${10000}
            = ${Math.round(largeCI[2] / 10000 * 100) / 100}`);
        }
        

    }

    distribution_CI_elements = [cross_bar, cross_bar_mid, cross_bar_top,  ci_min, ci_max, ci_min_text, ci_max_text, ci_min_top, ci_max_top, ci_min_text_top, ci_max_text_top, ci_pop_stat_arrow, ci_pop_stat_text, ci_num_line, ci_num_text];
    return [distribution_elements, distribution_stat_elements, distribution_CI_elements, distribution_extra];
}

function placeElements(elements, dimensions, bounds, options, min, max){
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
                let prop_circles = elements.all.filter((e) => e.type=='datapoint' && e.attrs.factorX == prop_rect.getAttr('factorX') && e.attrs.factorY == prop_rect.getAttr('factorY'));
                let width_margin = width - 2;
                let height_margin = height - 2;
                let items = parseInt(prop_rect.getAttr('items'));
                let min_r = 2;
                let max_r = Math.min(width_margin, height_margin);
                let radius = max_r;
                let rows = 1;
                let row_l = items;
                let max_row_length = width_margin / (min_r * 2);
                let width_r = width_margin / (row_l*2);
                let height_r = height_margin / (rows*2);
                let it_max = 20;
                let it = 0;
                while(it < it_max && (max_row_length < row_l || height_r > width_r * 1.5)){
                    rows++;
                    row_l = Math.ceil(items/rows);
                    width_r = width_margin / (row_l*2);
                    height_r = height_margin / (rows*2);
                    it++;
                }
                rows = Math.ceil(items/row_l);
                width_r = width_margin / (row_l*2);
                height_r = height_margin / (rows*2);
                radius = Math.min(width_r, height_r);
                let y_free_space = height_margin - (rows * radius * 2);
                let y_top_margin = y_free_space / 2;
                let x_free_space = width_margin - (row_l * radius * 2);
                let x_left_margin = x_free_space / 2;
                let r = 0;
                let c = 0;
                let lim = Math.min(items, max_row_length * (height_margin / (min_r *2)), 500);
                for(let i = 0; i < lim; i++){
                    
                    let x = prop_rect.attrs.x + x_left_margin + radius + (radius * 2)*r;
                    let y = prop_rect.attrs.y + y_top_margin + radius + (radius * 2)*c;
                    prop_circles[i].setAttrInit('x', x);
                    prop_circles[i].setAttrInit('y', y);
                    prop_circles[i].setAttrInit('r', radius);
                    prop_circles[i].setAttrInit('stroke-color', d3.color(config.proportionColorsList[e]).brighter(2));
                    prop_circles[i].setAttrInit('fill-color', d3.color(config.proportionColorsList[e]).brighter(2));
                    prop_circles[i].setAttrInit('fill-opacity', 0);
                    prop_circles[i].setAttrInit('stroke-opacity', 0);
                    prop_circles[i].setAttr('stroke-opacity', 0);
                    r++;
                    if(r == row_l){
                        c++;
                        r = 0;
                    }
                }
            }


            console.log(sum);
        }
        
    }

}
function placeCI(ci, area, min, max, dimensions){

}
function placeDistribution(datapoints, ci, area, vertical, min, max, stat_markers, largeCI = [0, 0, 0]){
    let text_margin = vis.areas['sec2axis'].height / 1.5;
    if(datapoints[0].type == "distribution"){   
        if(! vertical){
            heap(datapoints, area, min, max, false, 5);
        }else{
            heap(datapoints, area, min, max, true, 5);
        }
    }else{
        heap_line(datapoints, area, min, max, false, 5);
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
    let [cross_bar, cross_bar_mid, cross_bar_top, ci_min, ci_max, ci_min_text, ci_max_text, ci_min_top, ci_max_top, ci_min_text_top, ci_max_text_top, ci_pop_stat_arrow, ci_pop_stat_text, ci_num_line, ci_num_text] = ci;
    if(!vertical){
        cross_bar.setAttrInit('x1', min_ci_screen_x);
        cross_bar.setAttrInit('x2', max_ci_screen_x);
        cross_bar.setAttrInit('y1', area.split(2, 1)[1]);
        cross_bar.setAttrInit('y2', area.split(2, 1)[1]);
        cross_bar.setAttrInit('lineWidth', 3);
        cross_bar.setAttrInit('large_x1', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        cross_bar.setAttrInit('large_x2', linearScale(largeCI[1], [min, max], [area.left, area.right]));


        cross_bar_mid.setAttrInit('x1', min_ci_screen_x);
        cross_bar_mid.setAttrInit('x2', max_ci_screen_x);
        cross_bar_mid.setAttrInit('large_x1', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        cross_bar_mid.setAttrInit('large_x2', linearScale(largeCI[1], [min, max], [area.left, area.right]));
        cross_bar_mid.setAttrInit('y1', area.split(2, 1)[1]);
        cross_bar_mid.setAttrInit('y2', area.split(2, 1)[1]);
        cross_bar_mid.setAttrInit('lineWidth', 3);
        cross_bar_top.setAttrInit('x1', min_ci_screen_x);
        cross_bar_top.setAttrInit('x2', max_ci_screen_x);
        cross_bar_top.setAttrInit('large_x1', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        cross_bar_top.setAttrInit('large_x2', linearScale(largeCI[1], [min, max], [area.left, area.right]));
        cross_bar_top.setAttrInit('y1', area.split(2, 1)[1]);
        cross_bar_top.setAttrInit('y2', area.split(2, 1)[1]);
        cross_bar_top.setAttrInit('lineWidth', 3);
        ci_min.setAttrInit('x1', min_ci_screen_x);
        ci_min.setAttrInit('x2', min_ci_screen_x);
        ci_min.setAttrInit('large_x1', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        ci_min.setAttrInit('large_x2', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        ci_min.setAttrInit('y1', area.split(2, 1)[1]);
        ci_min.setAttrInit('y2', area.split(2, 2)[1]);
        ci_max.setAttrInit('x1', max_ci_screen_x);
        ci_max.setAttrInit('x2', max_ci_screen_x);
        ci_max.setAttrInit('large_x1', linearScale(largeCI[1], [min, max], [area.left, area.right]));
        ci_max.setAttrInit('large_x2', linearScale(largeCI[1], [min, max], [area.left, area.right]));
        ci_max.setAttrInit('y1', area.split(2, 1)[1]);
        ci_max.setAttrInit('y2', area.split(2, 2)[1]);
        ci_min_text.setAttrInit('x', min_ci_screen_x);
        ci_min_text.setAttrInit('large_x', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        ci_min_text.setAttrInit('y',area.split(2, 2)[1] + text_margin);
        ci_min_text.setAttrInit('text', Math.round(ci_min_text.getAttr('actual_value') * 100) / 100);
        ci_min_text.setAttrInit('large_text', Math.round(largeCI[0] * 100) / 100);
        ci_min_text.setAttrInit('fill-color', 'red');
        ci_min_text.setAttrInit('align', 'middle');
        ci_max_text.setAttrInit('x', max_ci_screen_x);
        ci_max_text.setAttrInit('large_x', linearScale(largeCI[1], [min, max], [area.left, area.right]));
        ci_max_text.setAttrInit('y',area.split(2, 2)[1] + text_margin);
        ci_max_text.setAttrInit('text', Math.round(ci_max_text.getAttr('actual_value') * 100) / 100);
        ci_max_text.setAttrInit('large_text', Math.round(largeCI[1] * 100) / 100);
        ci_max_text.setAttrInit('fill-color', 'red');
        ci_max_text.setAttrInit('align', 'middle');
        ci_min_top.setAttrInit('x1', min_ci_screen_x);
        ci_min_top.setAttrInit('x2', min_ci_screen_x);
        ci_min_top.setAttrInit('large_x1', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        ci_min_top.setAttrInit('large_x2', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        ci_min_top.setAttrInit('y1', area.split(2, 1)[1]);
        ci_min_top.setAttrInit('y2', area.split(2, 2)[1]);
        ci_max_top.setAttrInit('x1', max_ci_screen_x);
        ci_max_top.setAttrInit('x2', max_ci_screen_x);
        ci_max_top.setAttrInit('large_x1', linearScale(largeCI[1], [min, max], [area.left, area.right]));
        ci_max_top.setAttrInit('large_x2', linearScale(largeCI[1], [min, max], [area.left, area.right]));
        ci_max_top.setAttrInit('y1', area.split(2, 1)[1]);
        ci_max_top.setAttrInit('y2', area.split(2, 2)[1]);
        ci_min_text_top.setAttrInit('x', min_ci_screen_x);
        ci_min_text_top.setAttrInit('large_x', linearScale(largeCI[0], [min, max], [area.left, area.right]));
        ci_min_text_top.setAttrInit('y',area.split(2, 2)[1] + text_margin);
        ci_min_text_top.setAttrInit('text', Math.round(ci_min_text.getAttr('actual_value') * 100) / 100);
        ci_min_text_top.setAttrInit('large_text', Math.round(largeCI[0] * 100) / 100);
        ci_min_text_top.setAttrInit('fill-color', 'red');
        ci_min_text_top.setAttrInit('align', 'middle');
        ci_max_text_top.setAttrInit('x', max_ci_screen_x);
        ci_max_text_top.setAttrInit('large_x', linearScale(largeCI[1], [min, max], [area.left, area.right]));
        ci_max_text_top.setAttrInit('y',area.split(2, 2)[1] + text_margin);
        ci_max_text_top.setAttrInit('text', Math.round(ci_max_text.getAttr('actual_value') * 100) / 100);
        ci_max_text_top.setAttrInit('large_text', Math.round(largeCI[1] * 100) / 100);
        ci_max_text_top.setAttrInit('fill-color', 'red');
        ci_max_text_top.setAttrInit('align', 'middle');
        
        let pop_stat_arrow = stat_markers.filter((e) => e.id.includes('dist_stat_arrow'));
        if(pop_stat_arrow.length == 1){
            ci_pop_stat_arrow.setAttrInit('y1', pop_stat_arrow[0].getAttr('y1'));
            ci_pop_stat_arrow.setAttrInit('y2', pop_stat_arrow[0].getAttr('y2'));
            ci_pop_stat_arrow.setAttrInit('x1', pop_stat_arrow[0].getAttr('x1'));
            ci_pop_stat_arrow.setAttrInit('x2', pop_stat_arrow[0].getAttr('x2'));
            ci_pop_stat_text.setAttrInit('y', pop_stat_arrow[0].getAttr('y2') + 2);
            ci_pop_stat_text.setAttrInit('x', (pop_stat_arrow[0].getAttr('x1') + pop_stat_arrow[0].getAttr('x2')) / 2 );
            ci_pop_stat_text.setAttrInit('align', 'middle');
            ci_pop_stat_text.setAttrInit('alignment-baseline', 'after-edge');
            ci_pop_stat_text.setAttrInit('selected', 1);
            ci_pop_stat_arrow.setAttrInit('selected', 1);


        }else if(pop_stat_arrow.length > 1){
            let arrow_width = ci_pop_stat_arrow.getAttr('dist_x2') - ci_pop_stat_arrow.getAttr('dist_x1');
            ci_pop_stat_arrow.setAttrInit('y1', pop_stat_arrow[0].getAttr('y1') - 50);
            ci_pop_stat_arrow.setAttrInit('y2', pop_stat_arrow[0].getAttr('y2') - 50);
            ci_pop_stat_arrow.setAttrInit('x1', pop_stat_arrow[0].getAttr('x2') - arrow_width/2);
            ci_pop_stat_arrow.setAttrInit('x2', pop_stat_arrow[0].getAttr('x2') + arrow_width/2);
            ci_pop_stat_text.setAttrInit('y', pop_stat_arrow[0].getAttr('y1') - 50);
            ci_pop_stat_text.setAttrInit('x', (pop_stat_arrow[0].getAttr('x2')));
            ci_pop_stat_text.setAttrInit('align', 'middle');
            ci_pop_stat_text.setAttrInit('alignment-baseline', 'after-edge');
            ci_pop_stat_text.setAttrInit('selected', 1);
            ci_pop_stat_arrow.setAttrInit('selected', 1);
        }
        ci_num_line.setAttrInit('y1', area.split(2, 1)[1]);
        ci_num_line.setAttrInit('y2', area.split(2, 2)[1]);
        ci_num_text.setAttrInit('y', area.split(2, 1)[1]);
        
    }else{
        cross_bar.setAttrInit('y1', min_ci_screen_y);
        cross_bar.setAttrInit('y2', max_ci_screen_y);
        cross_bar.setAttrInit('x1', max_ci_screen_x);
        cross_bar.setAttrInit('x2', max_ci_screen_x);
        ci_min.setAttrInit('y1', min_ci_screen_y);
        ci_min.setAttrInit('y2', min_ci_screen_y);
        ci_min.setAttrInit('x1', max_ci_screen_x);
        ci_min.setAttrInit('x2', min_ci_screen_x);
        ci_max.setAttrInit('y1', max_ci_screen_y);
        ci_max.setAttrInit('y2', max_ci_screen_y);
        ci_max.setAttrInit('x1', max_ci_screen_x);
        ci_max.setAttrInit('x2', min_ci_screen_x);
        ci_min.type = "arrow";
        ci_min.setAttrInit('selected', 1);
        ci_max.type = "arrow";
        ci_max.setAttrInit('selected', 1);
    }


    
}

function getPopulationStatistic(dataset, statistic, dimensions){
    if(dimensions.length > 1 && dimensions[1].factors.length == 2){
        let f0_stat = dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[0]].statistics[statistic];
        let f1_stat = dataset[dimensions[0].name][dimensions[1].name][dimensions[1].factors[1]].statistics[statistic];
        return [f1_stat - f0_stat, f0_stat, f1_stat];
    }
    if(dimensions.length > 1 && dimensions[1].factors.length > 2){
        return [dataset.statistics[statistic], 0, dataset.statistics[statistic]];
    }
    return [dataset.statistics[statistic]];
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
function heap_line(elements, bounds, min, max, vertical, base_margin){
    let max_v = max == undefined ? elements.reduce((a, c)=> c.value > a ? c.value : a, -100000) : max;
    let min_v = min == undefined ? elements.reduce((a, c)=> c.value < a ? c.value : a, 1000000) : min;
    let screen_range = !vertical ? [bounds.left, bounds.right] : [bounds.bottom, bounds.top];
    let screen_range_vert = !vertical ? [bounds.bottom, bounds.top] : [bounds.left, bounds.right];
    var spaceAvaliable = Math.abs(screen_range_vert[0] - screen_range_vert[1]);
    let base_margin_value = base_margin || Math.abs(bounds.bottom - bounds.top)/4
    // let elements_to_fit = elements.length;
    let elements_to_fit = 40;
    var spacePerElement = spaceAvaliable/elements_to_fit
    for(let e = 0; e < elements.length; e++){
        let y = spacePerElement * Math.min(e, elements_to_fit);
        let element = elements[e];
        let screen_x = linearScale(element.value, [min_v, max_v], screen_range);
        element.setAttrInit('y', bounds.bottom  - base_margin_value - y);
        element.setAttrInit('x', screen_x);
        element.setAttrInit('lineWidth', spacePerElement - 2);
        element.calcLineHeapY = function(index){
            let y = bounds.bottom - base_margin_value - (spacePerElement * index);
            return y; 
        }
        element.lower_draw_bound = bounds.bottom;
    }
}

function sectionAreas(overall_bounds){
    let areas = {};
    areas.overall = new Area(overall_bounds.left, overall_bounds.right, overall_bounds.top, overall_bounds.bottom, overall_bounds.PIXEL_RATIO);
    let num_sections = 3;
    for(let i = 0; i < num_sections; i++){
        let sec_bounds = {left: overall_bounds.left, right: overall_bounds.right, top: (i) * (overall_bounds.height / num_sections), bottom: (i+1) * (overall_bounds.height / num_sections)};
        areas["sec"+i] = new Area(sec_bounds.left, sec_bounds.right, sec_bounds.top, sec_bounds.bottom, overall_bounds.PIXEL_RATIO);
        let ten = areas["sec"+i].split(10, 1)[1];
        areas["sec"+i+"title"] = new Area(sec_bounds.left, sec_bounds.right, sec_bounds.top, ten, overall_bounds.PIXEL_RATIO);
        let ninty = areas["sec"+i].split(10, 9)[1];
        areas["sec"+i+"display"] = new Area(sec_bounds.left, sec_bounds.right, ten, ninty, overall_bounds.PIXEL_RATIO);
        areas["sec"+i+"axis"] = new Area(sec_bounds.left, sec_bounds.right, ninty, sec_bounds.bottom, overall_bounds.PIXEL_RATIO);
    }
    let sec_bounds = {left: overall_bounds.left, right: overall_bounds.right, top: (2) * (overall_bounds.height / num_sections), bottom: (3) * (overall_bounds.height / num_sections)};
    let seventy = areas["sec2"].split(10, 7)[0];
    areas["sec2regL"] = new Area(sec_bounds.left, seventy, sec_bounds.top, sec_bounds.bottom, overall_bounds.PIXEL_RATIO);
    let ten = areas["sec2regL"].split(10, 1)[1];
    areas["sec2regL"+"title"] = new Area(sec_bounds.left, seventy, sec_bounds.top, ten, overall_bounds.PIXEL_RATIO);
    let ninty = areas["sec2regL"].split(10, 9)[1];
    areas["sec2regL"+"display"] = new Area(sec_bounds.left, seventy, sec_bounds.top, sec_bounds.bottom, overall_bounds.PIXEL_RATIO);
    areas["sec2regL"+"axis"] = new Area(sec_bounds.left, seventy, ninty, sec_bounds.bottom, overall_bounds.PIXEL_RATIO);

    areas["sec2regR"] = new Area(seventy, sec_bounds.right, sec_bounds.top, sec_bounds.bottom, overall_bounds.PIXEL_RATIO);
    ten = areas["sec2regR"].split(10, 1)[0];
    ninty = areas["sec2regR"].split(10, 9)[0];
    areas["sec2regR"+"title"] = new Area(ninty, sec_bounds.right, sec_bounds.top, sec_bounds.bottom), overall_bounds.PIXEL_RATIO;
    
    areas["sec2regR"+"display"] = new Area(ten, ninty, sec_bounds.top, sec_bounds.bottom, overall_bounds.PIXEL_RATIO);
    areas["sec2regR"+"axis"] = new Area(seventy, ten, sec_bounds.top, sec_bounds.bottom, overall_bounds.PIXEL_RATIO);

    return areas;
}

class Area {
    constructor(l, r, t, b, pr){
        this.top = t;
        this.bottom = b;
        this.left = l;
        this.right = r;
        this.margin = 5 * pr;
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