function ma_createAnimation(animation, pop_dimensions, sample_dimensions, static_elements, dynamic_elements, module, speed, sample_index, include_distribution){
    let stage = null;
    if(pop_dimensions[0].type == 'numeric'){
        if(module.name == 'Bootstrapping'){
            bootstrap_fade_in(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, 5000);
        }else{
            stage = new animStage('fade', animation.name, 5000/speed);
            point_fade_stage(static_elements, dynamic_elements, stage, sample_index);
            animation.addStage(stage);
        }

        delayStage(animation, 1000/speed);

        stage = new animStage('drop', animation.name, 5000/speed);
        point_drop_stage(static_elements, dynamic_elements, stage);
        animation.addStage(stage);
    }else{
        stage = new animStage('fade', animation.name, 5000/speed);
        prop_fade_stage(static_elements, dynamic_elements, stage, sample_index);
        animation.addStage(stage);

        
    }
    
    delayStage(animation, 1000/speed);
    if(include_distribution){
        delayStage(animation, 1000/speed);

        stage = new animStage('drop', animation.name, 5000/speed);
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
function bootstrap_fade_in(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, time){
    let sample = vis.samples[sample_index];
    let sample_length = sample.all.length;
    let stage_duration = time / sample_length;
    let stage = new animStage('b_fade', animation.name, stage_duration);
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index);
    
    let sample_permute = new Array(sample_length).fill(0).map((e, i) => i);
    
    d3.shuffle(sample_permute);

    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
    }
    animation.addStage(stage);
    for(let i = 0; i < sample_length; i++){
        stage = new animStage('b_fade', animation.name, stage_duration);
        stage.setFunc(()=>{
            if(!dd_showing) dd_toggle();
            dd_clearDatapoints({all: d3.permute(sample.all, sample_permute)}, pop_dimensions, sample_dimensions);
            dd_updateSingleDatapoints({all: d3.permute(sample.all, sample_permute)}, pop_dimensions, sample_dimensions, i, false);
        });
        
        let element = dynamic_elements.datapoints.all[sample_permute[i]];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        //pop_elements.push(pop_element);
        for(let n = 0; n < i; n++){
            let element = dynamic_elements.datapoints.all[sample_permute[n]];
            let element_id = element.getAttr('id');
            let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
            //pop_elements.push(pop_element);
            stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
            stage.setTransition(element, 'fill-opacity', 1, 1, 0, 1);
            stage.setTransition(element, 'stroke-opacity', 1, 1, 0, 1);
            stage.setTransition(element, 'selected', n == i - 1 ? 1 : 0, 0, 0, 1);
        }
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
        stage.setTransition(element, 'fill-opacity', 0, 1, 0, 0);
        stage.setTransition(element, 'stroke-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'selected', 1, 1, 0, 1);
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

function prop_fade_stage(static_elements, dynamic_elements, stage, sample_index){
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'fill-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'stroke-opacity', 0, 1, 0, 1);
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
    let distribution_stats = [];
    for(let i = 0; i < dynamic_elements.distribution.stats.length && i <= sample_index; i++){
        distribution_stats = distribution_stats.concat(dynamic_elements.distribution.stats[i]);
    }
    for(let i = 0; i < distribution_stats.length; i++){
        let element = distribution_stats[i];
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


function point_drop_stage(static_elements, dynamic_elements, stage){
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

function dist_drop_point_stage(static_elements, dynamic_elements, stage, sample_index, numeric){
    let stat_marker = dynamic_elements.stat_markers[dynamic_elements.stat_markers.length - 1];
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];
    stage.setTransition(stat_marker, 'y1', stat_marker.getAttr('init_y1'), dist_elem.getAttr('init_y'), 0, 1);
    stage.setTransition(stat_marker, 'y2', stat_marker.getAttr('init_y2'), dist_elem.getAttr('init_y'), 0, 1);
    stage.setTransition(stat_marker, 'selected', 0, 1, 0, 0);
    stage.setTransition(dist_elem, 'stroke-opacity', 0, 1, 0.9, 1);
    stage.setTransition(dist_elem, 'fill-opacity', 0, 1, 0.9, 1);
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
    let middle_x = vis.areas['sec2display'].split(2, 0)[1];
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


}

function dist_drop_devi_stage_2(static_elements, dynamic_elements, stage, sample_index, numeric){
    let stat_markers = dynamic_elements.stat_markers
                        .slice(0, dynamic_elements.stat_markers.length - 2)
                        .filter((e)=>e.type == 'arrow');
    let deviation_arrow = dynamic_elements.stat_markers[dynamic_elements.stat_markers.length - 1];
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];

    let y_pos = vis.areas['sec2display'].top;
    let middle_x = vis.areas['sec2display'].split(2, 0)[1];
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
    if(numeric) {
        for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
            let element = dynamic_elements.datapoints.all[i];
            stage.setTransition(element, 'selected', 1, 0, 0, 0);
        }
    }
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