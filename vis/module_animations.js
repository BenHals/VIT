function ma_createAnimation(animation, pop_dimensions, sample_dimensions, static_elements, dynamic_elements, module, speed, sample_index, include_distribution, animate_points){
    let stage = null;
    let sample_length = vis.samples[sample_index].all.length;
    let sample_permute = new Array(sample_length).fill(0).map((e, i) => i);
    d3.shuffle(sample_permute);
    if(pop_dimensions[0].type == 'numeric'){
        let skip = speed > 10;
        if(!skip){
            if(module.name == 'Bootstrapping'){
                bootstrap_fade_in(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, 5000/speed, animate_points, sample_permute);
                if(animate_points){
                    bootstrap_animate_points(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, 10000/speed, animate_points, sample_permute);
                }
            }else{
                stage = new animStage('fade', animation.name, include_distribution ? 1000/speed : 5000/speed);
                point_fade_stage(static_elements, dynamic_elements, stage, sample_index);
                animation.addStage(stage);
            }

            delayStage(animation, 1000/speed);
            if(module.name == 'Bootstrapping'){
                stage = new animStage('fade', animation.name, include_distribution ? 100/speed : 100/speed);
                point_skip_drop(static_elements, dynamic_elements, stage, sample_index);
                animation.addStage(stage);
            }else{
                stage = new animStage('drop', animation.name, include_distribution ? 1000/speed : 5000/speed);
                if(module.name == 'Randomisation Variation'){
                    point_center_drop_stage(static_elements, dynamic_elements, stage);
                    animation.addStage(stage);
                    stage = new animStage('drop2', animation.name, include_distribution ? 1000/speed : 5000/speed);
                    point_center_split_stage(static_elements, dynamic_elements, stage);
                }else{
                    point_drop_stage(static_elements, dynamic_elements, stage);
                }
                
                animation.addStage(stage);
            }

        }else{
            stage = new animStage('fade', animation.name, include_distribution ? 1000/speed : 2000/speed);
            if(module.name == "Bootstrapping"){
                stage.setFunc(()=>{
                    if(!dd_showing) dd_toggle();
                    dd_clearDatapoints({}, pop_dimensions, sample_dimensions);
                    dd_updateDatapoints({all: vis.samples[sample_index].all}, pop_dimensions, sample_dimensions, false)
                });
            }
            point_skip_drop(static_elements, dynamic_elements, stage, sample_index);
            animation.addStage(stage);
        }
    }else{
        stage = new animStage('fadePoint', animation.name, include_distribution ? 1000/speed : 5000/speed);
        let selected_elements = prop_point_fade_stage(static_elements, dynamic_elements, stage, sample_index);
        animation.addStage(stage);
        stage = new animStage('pointDrop', animation.name, include_distribution ? 1000/speed : 5000/speed);
        prop_point_drop_stage(static_elements, dynamic_elements, stage, sample_index, selected_elements);
        animation.addStage(stage);
        stage = new animStage('fadeBar', animation.name, include_distribution ? 1000/speed : 5000/speed);
        prop_fade_stage(static_elements, dynamic_elements, stage, sample_index);
        animation.addStage(stage);

        
    }
    
    delayStage(animation, 1000/speed);
    if(include_distribution){
        delayStage(animation, 1000/speed);

        stage = new animStage('drop', animation.name, include_distribution ? 1000/speed : 5000/speed);
        if(sample_dimensions.length > 1){
            if(sample_dimensions[1].type == 'numeric'){
                dist_drop_slope_stage(static_elements, dynamic_elements, stage, sample_index);
            }else{
                if(sample_dimensions[1].factors.length == 2){
                    dist_drop_diff_stage(static_elements, dynamic_elements, stage, sample_index);
                }else if(sample_dimensions[1].factors.length > 2){
                    dist_drop_devi_stage(static_elements, dynamic_elements, stage, sample_index, sample_dimensions[0].type == 'numeric');
                }
            }
        }else if(sample_dimensions.length < 2){
            dist_drop_point_stage(static_elements, dynamic_elements, stage, sample_index, sample_dimensions[0].type == 'numeric');
        }
        
        animation.addStage(stage);

        if(sample_dimensions.length > 1 && sample_dimensions[1].factors.length > 2){
            stage = new animStage('devi2', animation.name, 5000/speed);
            dist_drop_devi_stage_2(static_elements, dynamic_elements, stage, sample_index, sample_dimensions[0].type == 'numeric');
            animation.addStage(stage);
        }
    }
    delayStage(animation, 1000/speed);


    
}

function delayStage(animation, delay){
    let stage = new animStage('delay', animation.name, delay);
    animation.addStage(stage);
}
function bootstrap_fade_in(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, time, animate_points, sample_permute){
    let sample = vis.samples[sample_index];
    let sample_length = sample.all.length;
    let stage_duration = time / sample_length;
    let stage = new animStage('b_fade', animation.name, stage_duration);
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index);
    


    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
    }
    animation.addStage(stage);
    let faded_in = [];
    for(let i = 0; i < sample_length; i++){
        stage = new animStage('b_fade' + i, animation.name, stage_duration);
        stage.setFunc(()=>{
            if(!dd_showing) dd_toggle();
            dd_clearDatapoints({all: d3.permute(sample.all, sample_permute)}, pop_dimensions, sample_dimensions);
            dd_updateSingleDatapoints({all: vis.dataset.all, permuted: d3.permute(sample.all, sample_permute)}, pop_dimensions, sample_dimensions, sample_permute[i], i, false);
        });
        for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
            let stat_marker = dynamic_elements.stat_markers[i];
            stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
        }
        let element = dynamic_elements.datapoints.all[sample_permute[i]];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        //pop_elements.push(pop_element);
        for(let n = 0; n < sample_length; n++){
            if(n == i) continue;
            let element = dynamic_elements.datapoints.all[sample_permute[n]];
            let element_id = element.getAttr('id');
            let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
            let fill = faded_in.includes(pop_element) ? 1 : 0;
            stage.setTransition(pop_element, 'fill-opacity', fill, fill, 0, 0);
            if(n >= i){
                stage.setTransition(element, 'fill-opacity', 0, 0, 0, 1);
                
                continue;
            }
            //pop_elements.push(pop_element);
            //stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
            stage.setTransition(element, 'y', animate_points ? element.getAttr('init_y') : pop_element.getAttr('init_y'), animate_points ? element.getAttr('init_y') : pop_element.getAttr('init_y'), 0, 1);
            stage.setTransition(element, 'fill-opacity', 1, 1, 0, 1);
            stage.setTransition(element, 'stroke-opacity', 1, 1, 0, 1);
            stage.setTransition(element, 'selected', n == i - 1 ? 1 : 0, 0, 0, 1);
        }
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), animate_points ? element.getAttr('init_y') : pop_element.getAttr('init_y'), 0, 1);
        stage.setTransition(element, 'fill-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'stroke-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'selected', 0, 1, 0, 1);
        if(!faded_in.includes(pop_element)){
            stage.setTransition(pop_element, 'fill-opacity', 0, 1, 0, 1);
            faded_in.push(pop_element);
        }
        animation.addStage(stage);
        delayStage(animation, stage_duration);
    }

}
function bootstrap_animate_points(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, time, animate_points, sample_permute){
    let sample = vis.samples[sample_index];
    let sample_length = sample.all.length;
    let stage_duration = time / sample_length;
    let stage = new animStage('b_ani', animation.name, stage_duration);
    let faded_in = [];
    for(let i = 0; i < vis.dataset.all.length; i++){
        stage = new animStage('b_ani' + i, animation.name, stage_duration);
        stage.setFunc(()=>{
            if(!dd_showing) dd_toggle();
            dd_clearDatapoints({all: d3.permute(sample.all, sample_permute)}, pop_dimensions, sample_dimensions);
            dd_linkSingleDatapoint({all: vis.dataset.all, permuted: d3.permute(sample.all, sample_permute)}, pop_dimensions, sample_dimensions, sample_permute[i], i, false);
        });
        for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
            let stat_marker = dynamic_elements.stat_markers[i];
            stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
        }
        let pop_element_data = vis.dataset.all[i];
        
        let element_id = pop_element_data.id;
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        let sample_elements = dynamic_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id);
        for(let n = 0; n < sample_length; n++){
            let element = dynamic_elements.datapoints.all[sample_permute[n]];


            let fill = sample_elements.includes(element) ? 1 : 0;
            stage.setTransition(element, 'fill-opacity', 0, fill, 0, 0.3);
            stage.setTransition(element, 'selected', 0, fill, 0, 0.3);
        }
        for(let n = 0; n < static_elements.datapoints.all.length; n++){
            let pe = static_elements.datapoints.all[n];
            let fill = pe.getAttr('id') == element_id ? 1 : 0;
            stage.setTransition(pe, 'fill-opacity', 0, fill, 0, 0.3);
            stage.setTransition(pe, 'selected', 0, fill, 0, 0.3);
        }
        animation.addStage(stage);
        delayStage(animation, stage_duration);
    }

}

function point_fade_stage(static_elements, dynamic_elements, stage, sample_index){
    let pop_elements = [];
    let delay = 1/dynamic_elements.datapoints.all.length;
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        pop_elements.push(pop_element);
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
        stage.setTransition(element, 'fill-opacity', 0, 1, delay*i, delay*(i+1));
        stage.setTransition(element, 'stroke-opacity', 0, 1, delay*i, delay*(i+1));
        stage.setTransition(element, 'selected', 0, 1, delay*i, delay*(i+1));
    }
    for(let i = 0; i < static_elements.datapoints.all.length; i++){
        let element = static_elements.datapoints.all[i];
        let fill = pop_elements.includes(element) ? 1 : 0;
        stage.setTransition(element, 'fill-opacity', 0, fill, fill, fill);
    }
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index);
    
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
    }

    let dimensions = model.getSampleDimensions();

    if(dimensions.length > 1 && dimensions[1].type == 'numeric'){
        let distribution_slopes = dynamic_elements.all.filter((e)=>e.id == "dist_stat_lineline");
        for(let i = 0; i < distribution_slopes.length; i++){
            stage.setTransition(distribution_slopes[i], 'stroke-opacity', 0, i == distribution_slopes.length -1 ? 0 : 0.2, 0, 0);
        }
    }
}
function prop_point_fade_stage(static_elements, dynamic_elements, stage, sample_index){
    let pop_elements = [];
    let delay = 1/dynamic_elements.datapoints.all.length;
    let factor_names = [];
    let factor_items = {};
    for(let pop_circle_id = 0; pop_circle_id < static_elements.datapoints.all.length; pop_circle_id++){

        let pop_circle = static_elements.datapoints.all[pop_circle_id];
        if(pop_circle.type != 'datapoint') continue;
        let factor_name = pop_circle.attrs.text;
        if(!(factor_name in factor_items)){
            factor_names.push(factor_name);
            factor_items[factor_name] = [];
        }
        factor_items[factor_name].push(pop_circle);
    }
    let sample_factor_names = [];
    let sample_factor_items = {};
    for(let samp_circle_id = 0; samp_circle_id < dynamic_elements.datapoints.all.length; samp_circle_id++){

        let samp_circle = dynamic_elements.datapoints.all[samp_circle_id];
        if(samp_circle.type != 'datapoint') continue;
        let sample_factor_name = samp_circle.attrs.text;
        if(!(sample_factor_name in sample_factor_items)){
            sample_factor_names.push(sample_factor_name);
            sample_factor_items[sample_factor_name] = [];
        }
        sample_factor_items[sample_factor_name].push(samp_circle);
    }
    let selected_pop_elems = [];
    for(let n = 0; n < sample_factor_names.length; n++){
        let fac_name = sample_factor_names[n];
        d3.shuffle(factor_items[fac_name]);
        selected_pop_elems.push(factor_items[fac_name].slice(0, sample_factor_items[fac_name].length));
    }
    let selected_flat = selected_pop_elems.flat();
    // for(let i = 0; i < selected_flat.length; i++){
    //     let element = selected_flat[i];
    //     let element_id = element.getAttr('id');
    //     let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
    //     pop_elements.push(pop_element);
    //     stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
    //     stage.setTransition(element, 'fill-opacity', 0, 1, delay*i, delay*(i+1));
    //     stage.setTransition(element, 'stroke-opacity', 0, 1, delay*i, delay*(i+1));
    //     stage.setTransition(element, 'selected', 0, 1, delay*i, delay*(i+1));
    // }
    let elem_counter = 0;
    let dyn_elems = dynamic_elements.datapoints.all.filter((e) => e.type == 'datapoint');
    let sample_factor_count = {};
    for(let i = 0; i < static_elements.datapoints.all.length; i++){
        let element = static_elements.datapoints.all[i];
        if(element.type != 'datapoint') continue;
        let fill = selected_flat.includes(element) ? 1 : 0;
        stage.setTransition(element, 'fill-opacity', 0, fill, delay*elem_counter, delay*(elem_counter+1));
        stage.setTransition(element, 'stroke-opacity', 0, fill, delay*elem_counter, delay*(elem_counter+1));
        let pop_factorX = element.getAttr('factorX');

        if (!fill || elem_counter >= dyn_elems.length) continue;
        if(!(pop_factorX in sample_factor_count)){
            sample_factor_count[pop_factorX] = 0;
        }
        let dyn_element = sample_factor_items[pop_factorX][sample_factor_count[pop_factorX] ];
        stage.setTransition(dyn_element, 'y', element.getAttr('init_y'), element.getAttr('init_y'), delay*elem_counter, delay*(elem_counter+1));
        stage.setTransition(dyn_element, 'parent-y', element.getAttr('init_y'), element.getAttr('init_y'), delay*elem_counter, delay*(elem_counter+1));
        stage.setTransition(dyn_element, 'x', element.getAttr('init_x'), element.getAttr('init_x'), delay*elem_counter, delay*(elem_counter+1));
        stage.setTransition(dyn_element, 'parent-x', element.getAttr('init_x'), element.getAttr('init_x'), delay*elem_counter, delay*(elem_counter+1));
        stage.setTransition(dyn_element, 'fill-opacity', 0, 1, delay*elem_counter, delay*(elem_counter+1));
        sample_factor_count[pop_factorX]++;
        elem_counter += fill;
        // stage.setTransition(element, 'x', 0, 100 * fill, 0, fill);
        // stage.setTransition(element, 'y', 0, 100 * fill, 0, fill);

    }
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index);
    
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
        stage.setTransition(stat_marker, 'fill-opacity', 0, 1, 0, 1);
    }
    return selected_flat;

}

function point_skip_drop(static_elements, dynamic_elements, stage, sample_index){
    let pop_elements = [];
    let delay = 1/dynamic_elements.datapoints.all.length;
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        pop_elements.push(pop_element);
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
        stage.setTransition(element, 'fill-opacity', 1, 1, 0, 0);
        stage.setTransition(element, 'stroke-opacity', 1, 1, 0, 0);
        stage.setTransition(element, 'selected', 1, 1, 0, 0);
    }
    for(let i = 0; i < static_elements.datapoints.all.length; i++){
        let element = static_elements.datapoints.all[i];
        let fill = pop_elements.includes(element) ? 1 : 0;
        stage.setTransition(element, 'fill-opacity', fill, fill, 0, 1);
    }
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index);
    
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 0);
    }

    let dimensions = model.getSampleDimensions();

    if(dimensions.length > 1 && dimensions[1].type == 'numeric'){
        let distribution_slopes = dynamic_elements.all.filter((e)=>e.id == "dist_stat_lineline");
        for(let i = 0; i < distribution_slopes.length; i++){
            stage.setTransition(distribution_slopes[i], 'stroke-opacity', 0, i == distribution_slopes.length -1 ? 0 : 0.2, 0, 0);
        }
    }

    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'y', element.getAttr('init_y'), element.getAttr('init_y'), 0, 1);
    }
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 1, 1, 0, 0);
    }
}


function prop_fade_stage(static_elements, dynamic_elements, stage, sample_index){
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        let fill = element.type == 'datapoint' ? 0 : 1;
        stage.setTransition(element, 'fill-opacity', !fill, fill, 0, 1);
        stage.setTransition(element, 'stroke-opacity', !fill, fill, 0, 1);
    }
    element = dynamic_elements.stat_markers[0];
    stage.setTransition(element, 'fill-opacity', 0, 1, 0, 1);
    stage.setTransition(element, 'stroke-opacity', 0, 1, 0, 1);
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index);
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 1, 0.5, 1);
    }
}

function stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index){
    for(let i = 0; i < dynamic_elements.ghosts.length; i++){
        let element = dynamic_elements.ghosts[i];
        let y1 = element.getAttr('init_y1');
        let y2 = element.getAttr('init_y2');
        let x1 = element.getAttr('init_x1');
        let x2 = element.getAttr('init_x2');
        stage.setTransition(element, 'fill-opacity', 0.2, 0.2, 0, 1);
        stage.setTransition(element, 'stroke-opacity', 0.2, 0.2, 0, 1);
        if(x1 != x2) return;
        stage.setTransition(element, 'y2', y2 + (y1-y2)/1.5, y2 + (y1-y2)/1.5, 0, 1);
    }
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];
    stage.setTransition(dist_elem, 'stroke-opacity', 0, 0, 0, 1);
    stage.setTransition(dist_elem, 'fill-opacity', 0, 0, 0, 1);
}


function point_drop_stage(static_elements, dynamic_elements, stage, sample_index){
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), element.getAttr('init_y'), 0, 1);
    }
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 1, 0.8, 1);
    }

}
function prop_point_drop_stage(static_elements, dynamic_elements, stage, sample_index, selected_elements){
    for(let i = 0; i < selected_elements.length; i++){
        let element = dynamic_elements.datapoints.all.filter((e) => e.type == 'datapoint')[i];
        let element_id = element.getAttr('id');
        let pop_element = selected_elements[i];
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), element.getAttr('init_y'), 0, 1);
        stage.setTransition(element, 'x', pop_element.getAttr('init_x'), element.getAttr('init_x'), 0, 1);
        stage.setTransition(element, 'r', pop_element.getAttr('r'), element.getAttr('r'), 0.5, 1);
    }
    // for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
    //     let stat_marker = dynamic_elements.stat_markers[i];
    //     stage.setTransition(stat_marker, 'stroke-opacity', 0, 1, 0.8, 1);
    // }

}

function point_center_drop_stage(static_elements, dynamic_elements, stage){
    let middle_y = vis.areas['sec1display'].innerTop + vis.areas['sec1display'].innerHeight/2;
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), middle_y, 0, 0.75);
    }

}
function point_center_split_stage(static_elements, dynamic_elements, stage){
    let middle_y = vis.areas['sec1display'].innerTop + vis.areas['sec1display'].innerHeight/2;
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'y', middle_y, element.getAttr('init_y'), 0, 1);
    }
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 1, 0.8, 1);
    }
}

function dist_drop_point_stage(static_elements, dynamic_elements, stage, sample_index, numeric){
    let stat_marker = dynamic_elements.stat_markers[dynamic_elements.stat_markers.length - 1];
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];
    stage.setTransition(stat_marker, 'y1', stat_marker.getAttr('init_y1'), dist_elem.getAttr('init_y'), 0, 1);
    stage.setTransition(stat_marker, 'y2', stat_marker.getAttr('init_y2'), dist_elem.getAttr('init_y'), 0, 1);
    stage.setTransition(stat_marker, 'lineWidth', 1, 3, 0, 0);
    stage.setTransition(stat_marker, 'selected', 0, 1, 0, 0);
    stage.setTransition(dist_elem, 'stroke-opacity', 0, 1, 0.8, 1);
    stage.setTransition(dist_elem, 'fill-opacity', 0, 1, 0.8, 1);

    if(numeric) {
        for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
            let element = dynamic_elements.datapoints.all[i];
            stage.setTransition(element, 'selected', 1, 0, 0, 0);
        }
    }
}

function dist_drop_devi_stage(static_elements, dynamic_elements, stage, sample_index, numeric){
    let stat_markers = dynamic_elements.stat_markers
                        .slice(0, dynamic_elements.stat_markers.length - 2)
                        .filter((e)=>e.type == 'arrow');
    let deviation_arrow = dynamic_elements.stat_markers[dynamic_elements.stat_markers.length - 1];
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];

    let y_pos = vis.areas['sec2display'].top;
    let middle_x = vis.areas['sec2display'].innerLeft + vis.areas['sec2display'].innerWidth/2;
    for(let i = 0; i < stat_markers.length; i++){
        let marker = stat_markers[i];
        let width = marker.attrs['x2'] - marker.attrs['x1'];
        stage.setTransition(marker, 'y1', marker.getAttr('init_y1'), y_pos, 0, 0.6);
        stage.setTransition(marker, 'y2', marker.getAttr('init_y2'), y_pos, 0, 0.6);
        stage.setTransition(marker, 'x1', marker.getAttr('init_x1'), middle_x - width/2, 0, 0.6);
        stage.setTransition(marker, 'x2', marker.getAttr('init_x2'), middle_x + width/2, 0, 0.6);
        stage.setTransition(marker, 'selected', 0, 1, 0, 0);

        y_pos += 10;
    }
    let width = deviation_arrow.attrs['x2'] - deviation_arrow.attrs['x1'];
    stage.setTransition(deviation_arrow, 'y1', deviation_arrow.getAttr('init_y1'), y_pos, 0, 0);
    stage.setTransition(deviation_arrow, 'y2', deviation_arrow.getAttr('init_y2'), y_pos, 0, 0);
    stage.setTransition(deviation_arrow, 'x1', deviation_arrow.getAttr('init_x1'), middle_x - width/2, 0, 0);
    stage.setTransition(deviation_arrow, 'x2', deviation_arrow.getAttr('init_x2'), middle_x + width/2, 0, 0);
    stage.setTransition(deviation_arrow, 'selected', 0, 0, 0, 0);
    stage.setTransition(deviation_arrow, 'stroke-opacity', 0, 1, 0.7, 1);
    if(numeric) {
        for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
            let element = dynamic_elements.datapoints.all[i];
            stage.setTransition(element, 'selected', 1, 0, 0, 0);
        }
    }


}

function dist_drop_devi_stage_2(static_elements, dynamic_elements, stage, sample_index, numeric){
    let stat_markers = dynamic_elements.stat_markers
                        .slice(0, dynamic_elements.stat_markers.length - 2)
                        .filter((e)=>e.type == 'arrow');
    let deviation_arrow = dynamic_elements.stat_markers[dynamic_elements.stat_markers.length - 1];
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];

    let y_pos = vis.areas['sec2display'].top;
    let middle_x = vis.areas['sec2display'].innerLeft + vis.areas['sec2display'].innerWidth/2;
    for(let i = 0; i < stat_markers.length; i++){
        let marker = stat_markers[i];
        stage.setTransition(marker, 'selected', 1, 0, 0, 0.3);

        y_pos += 10;
    }
    let width = deviation_arrow.attrs['x2'] - deviation_arrow.attrs['x1'];
    stage.setTransition(deviation_arrow, 'y1', y_pos, dist_elem.getAttr('y'), 0.3, 1);
    stage.setTransition(deviation_arrow, 'y2', y_pos, dist_elem.getAttr('y'), 0.3, 1);
    stage.setTransition(deviation_arrow, 'x1', middle_x - width/2, vis.areas['sec2display'].innerLeft,  0.3, 1);
    stage.setTransition(deviation_arrow, 'x2', middle_x + width/2, dist_elem.getAttr('x'), 0.3, 1);
    stage.setTransition(deviation_arrow, 'selected', 0, 1, 0, 0.3);


    stage.setTransition(dist_elem, 'stroke-opacity', 0, 1, 0.9, 1);
    stage.setTransition(dist_elem, 'fill-opacity', 0, 1, 0.9, 1);

}

function dist_drop_diff_stage(static_elements, dynamic_elements, stage, sample_index){
    let stat_marker = dynamic_elements.stat_markers[dynamic_elements.stat_markers.length - 1];
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];
    stage.setTransition(stat_marker, 'y1', stat_marker.getAttr('init_y1'), dist_elem.getAttr('init_y'), 0, 1);
    stage.setTransition(stat_marker, 'y2', stat_marker.getAttr('init_y2'), dist_elem.getAttr('init_y'), 0, 1);
    stage.setTransition(stat_marker, 'x1', stat_marker.getAttr('init_x1'), vis.areas["sec2display"].innerLeft + vis.areas["sec2display"].innerWidth/2, 0,  1);
    stage.setTransition(stat_marker, 'x2', stat_marker.getAttr('init_x2'), dist_elem.getAttr('init_x'), 0, 1);
    stage.setTransition(dist_elem, 'stroke-opacity', 0, 1, 0.9, 1);
    stage.setTransition(dist_elem, 'fill-opacity', 0, 1, 0.9, 1);
}
function dist_drop_slope_stage(static_elements, dynamic_elements, stage, sample_index){
    let stat_marker = dynamic_elements.stat_markers[dynamic_elements.stat_markers.length - 1];
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];
    let dist_line = dynamic_elements.distribution.stats[sample_index][0];
    stage.setTransition(stat_marker, 'y1', stat_marker.getAttr('init_y1'), dist_line.getAttr('init_y1'), 0, 1);
    stage.setTransition(stat_marker, 'y2', stat_marker.getAttr('init_y2'), dist_line.getAttr('init_y2'), 0, 1);
    stage.setTransition(stat_marker, 'x1', stat_marker.getAttr('init_x1'), dist_line.getAttr('init_x1'), 0, 1);
    stage.setTransition(stat_marker, 'x2', stat_marker.getAttr('init_x2'), dist_line.getAttr('init_x2'), 0, 1);
    stage.setTransition(stat_marker, 'selected', 0, 1, 0, 0);
    stage.setTransition(dist_elem, 'stroke-opacity', 0, 1, 0.9, 1);
    stage.setTransition(dist_elem, 'fill-opacity', 0, 1, 0.9, 1);
}
function ma_createDistributionAnimation(animation, pop_dimensions, sample_dimensions, static_elements, dynamic_elements, module, speed, sample_index){
    stage = new animStage('dist', animation.name, 10);
    if(module.name == "Bootstrapping"){
        stage.setFunc(()=>{
            if(!dd_showing) dd_toggle();
            dd_clearDatapoints({}, pop_dimensions, sample_dimensions);
            dd_updateDatapoints({all: vis.samples[sample_index].all}, pop_dimensions, sample_dimensions, false)
        });
    }
    for(let x = 0; x < 1000; x ++){
        let sample_markers = dynamic_elements.distribution.stats[x];
        for(let n = 0; n < sample_markers.length; n++){
            let sample_mark = sample_markers[n];
            let y1 = sample_mark.getAttr('init_y1');
            let y2 = sample_mark.getAttr('init_y2');
            let x1 = sample_mark.getAttr('init_x1');
            let x2 = sample_mark.getAttr('init_x2');
            stage.setTransition(sample_mark, 'stroke-opacity', 0, 0, 0, 0);
            if(x1 != x2) continue;
            stage.setTransition(sample_mark, 'y2', y2 + (y1-y2)/1.5, y2 + (y1-y2)/1.5, 0, 1);
            
        }
        let dist_datapoint = dynamic_elements.distribution.datapoints[x];
        stage.setTransition(dist_datapoint, 'stroke-opacity', 0, 0, 0, 0);
        stage.setTransition(dist_datapoint, 'fill-opacity', 0, 0, 0, 0);
    }
    animation.addStage(stage);
    for(let i = 0; i < 1000; i++){
        stage = new animStage('dist', animation.name, 10);
        stage.setFunc(function(){
            vis.dynamicElements.all = [];
            for(let i = 0; i < vis.dynamicElements.distribution.stats.length; i++){
                vis.dynamicElements.all = vis.dynamicElements.all.concat(vis.dynamicElements.distribution.stats[i]);
                vis.dynamicElements.all = vis.dynamicElements.all.concat([vis.dynamicElements.distribution.datapoints[i]]);
            }
            vis.initSample(vis.samples[i], vis.dynamicElements.distribution.stats[i], false);
        });
        let sample_markers = dynamic_elements.distribution.stats[i];
        for(let n = 0; n < sample_markers.length; n++){
            let sample_mark = sample_markers[n];
            stage.setTransition(sample_mark, 'stroke-opacity', 0, 0.2, 0, 0);
        }
        let dist_datapoint = dynamic_elements.distribution.datapoints[i];
        stage.setTransition(dist_datapoint, 'stroke-opacity', 0, 1, 0, 0);
        stage.setTransition(dist_datapoint, 'fill-opacity', 0, 1, 0, 0);
        animation.addStage(stage);
    }
    return animation;
}

function ma_createCIAnimation(animation, pop_dimensions, sample_dimensions, static_elements, dynamic_elements, module, speed, sample_index){
    stage = new animStage('dist', animation.name, 1000);
    stage.setFunc(function(){
        vis.dynamicElements.all = [];
        for(let i = 0; i < vis.dynamicElements.distribution.stats.length; i++){
            //vis.dynamicElements.all = vis.dynamicElements.all.concat(vis.dynamicElements.distribution.stats[i]);
            vis.dynamicElements.all = vis.dynamicElements.all.concat([vis.dynamicElements.distribution.datapoints[i]]);
        }
        vis.dynamicElements.all = vis.dynamicElements.all.concat(vis.dynamicElements.distribution.ci);
    });
    for(let i = 0; i < dynamic_elements.distribution.datapoints.length; i++){
        let dist_datapoint = dynamic_elements.distribution.datapoints[i];
        let opacity = dist_datapoint.getAttr('in_ci') ? 1 : 0.2;
        stage.setTransition(dist_datapoint, 'stroke-opacity', 1, opacity, 0, 1);
        stage.setTransition(dist_datapoint, 'fill-opacity', 1, opacity, 0, 1);
    }
    for(let i = 0; i < dynamic_elements.distribution.ci.length; i++){
        let dist_datapoint = dynamic_elements.distribution.ci[i];
        stage.setTransition(dist_datapoint, 'stroke-opacity', 0, 0, 0, 1);
        stage.setTransition(dist_datapoint, 'fill-opacity', 0, 0, 0, 1);
    }
    animation.addStage(stage);

    stage = new animStage('dist', animation.name, 1000);
    for(let i = 0; i < dynamic_elements.distribution.ci.length; i++){
        let dist_datapoint = dynamic_elements.distribution.ci[i];
        stage.setTransition(dist_datapoint, 'stroke-opacity', 0, 1, 0, 1);
        stage.setTransition(dist_datapoint, 'fill-opacity', 0, 1, 0, 1);
    }
    animation.addStage(stage);
    return animation;
}