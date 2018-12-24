function ma_createAnimation(animation, pop_dimensions, sample_dimensions, static_elements, dynamic_elements, module, speed, sample_index, include_distribution, animate_points){
    let stage = null;
    let sample_length = vis.samples[sample_index].all.length;
    let sample_permute = new Array(sample_length).fill(0).map((e, i) => i);
    d3.shuffle(sample_permute);
    let skip = speed > 10;
    if(module.name == "Bootstrapping"){
        if(pop_dimensions[0].type == 'numeric'){
            if(!skip){
                bootstrap_fade_in(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, 5000/speed, animate_points, sample_permute);
                if(animate_points){
                    bootstrap_animate_points(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, 10000/speed, animate_points, sample_permute);
                }
                delayStage(animation, 1000/speed);
                stage = new animStage('fade', animation.name, include_distribution ? 100/speed : 100/speed);
                point_skip_drop(static_elements, dynamic_elements, stage, sample_index);
                animation.addStage(stage);
            }else{
                stage = new animStage('fade', animation.name, include_distribution ? 1000/speed : 2000/speed);
                stage.setFunc(()=>{
                    if(!dd_showing) dd_toggle();
                    dd_clearDatapoints({all: vis.samples[sample_index].all}, pop_dimensions, sample_dimensions);
                    dd_updateDatapoints({all: vis.samples[sample_index].all}, pop_dimensions, sample_dimensions, false)
                });
                point_skip_drop(static_elements, dynamic_elements, stage, sample_index);
                animation.addStage(stage);
            }
        }else{
            prop_bootstrap_fade_in(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, 5000/speed, animate_points, sample_permute);
            if(animate_points){
                prop_bootstrap_animate_points(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, 10000/speed, animate_points, sample_permute);
            }
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
    }else if(module.name == "Randomisation Variation" || module.name == "Randomisation Test"){
        if(pop_dimensions[0].type == 'numeric'){
            if(!skip){
                if(speed < 2){
                    stage = new animStage('fade', animation.name, include_distribution ? 500/speed : 2500/speed);
                    randomisation_point_fade(static_elements, dynamic_elements, stage, sample_index);
                    animation.addStage(stage);
                    delayStage(animation, 1000/speed);
                    stage = new animStage('drop', animation.name, include_distribution ? 1000/speed : 5000/speed);
                    point_center_drop_stage(static_elements, dynamic_elements, stage);
                    animation.addStage(stage);
                }else{
                    stage = new animStage('drop', animation.name, include_distribution ? 1000/speed : 5000/speed);
                    point_center_skip_drop_stage(static_elements, dynamic_elements, stage, sample_index);
                    animation.addStage(stage);
                }


                stage = new animStage('drop2', animation.name, include_distribution ? 1000/speed : 5000/speed);
                point_center_split_stage(static_elements, dynamic_elements, stage);

                
                animation.addStage(stage);
            }else{
                stage = new animStage('skip_drop', animation.name, include_distribution ? 1000/speed : 2000/speed);
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
    }else if(module.name == "Confidence Interval"){
        if(pop_dimensions[0].type == 'numeric'){
            if(!skip){
                stage = new animStage('fade', animation.name, include_distribution ? 1000/speed : 5000/speed);
                point_fade_stage(static_elements, dynamic_elements, stage, sample_index, false);
                animation.addStage(stage);
                delayStage(animation, 1000/speed);
                stage = new animStage('drop', animation.name, include_distribution ? 1000/speed : 5000/speed);

                point_drop_stage(static_elements, dynamic_elements, stage, sample_index);
                point_drop_cirange_stage(static_elements, dynamic_elements, stage, sample_index);
                
                
                animation.addStage(stage);
            }else{
                stage = new animStage('fade', animation.name, include_distribution ? 1000/speed : 2000/speed);
                point_skip_drop_ci_range(static_elements, dynamic_elements, stage, sample_index);
                point_skip_drop(static_elements, dynamic_elements, stage, sample_index, false);
                animation.addStage(stage);
            }
        }else{
            stage = new animStage('fadePoint', animation.name, include_distribution ? 1000/speed : 5000/speed);
            let selected_elements = prop_point_fade_stage(static_elements, dynamic_elements, stage, sample_index);
            animation.addStage(stage);
            stage = new animStage('pointDrop', animation.name, include_distribution ? 1000/speed : 5000/speed);
            prop_point_drop_stage(static_elements, dynamic_elements, stage, sample_index, selected_elements, false);
            prop_point_drop_cirange_stage(static_elements, dynamic_elements, stage, sample_index, selected_elements);
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
                dist_drop_point_cirange_stage(static_elements, dynamic_elements, stage, sample_index, sample_dimensions[0].type == 'numeric');
            }
            
            animation.addStage(stage);
    
            if(sample_dimensions.length > 1 && sample_dimensions[1].factors.length > 2){
                stage = new animStage('devi2', animation.name, 5000/speed);
                dist_drop_devi_stage_2(static_elements, dynamic_elements, stage, sample_index, sample_dimensions[0].type == 'numeric');
                animation.addStage(stage);
            }
        }
        delayStage(animation, 1000/speed);
    }else{
        if(pop_dimensions[0].type == 'numeric'){
            if(!skip){
                stage = new animStage('fade', animation.name, include_distribution ? 1000/speed : 5000/speed);
                point_fade_stage(static_elements, dynamic_elements, stage, sample_index);
                animation.addStage(stage);
                delayStage(animation, 1000/speed);
                stage = new animStage('drop', animation.name, include_distribution ? 1000/speed : 5000/speed);

                point_drop_stage(static_elements, dynamic_elements, stage);
                
                
                animation.addStage(stage);
            }else{
                stage = new animStage('fade', animation.name, include_distribution ? 1000/speed : 2000/speed);
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
function prop_bootstrap_fade_in(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, time, animate_points, sample_permute){
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
    let sorted_datapoints = dynamic_elements.datapoints.all.filter((e)=> e.type == 'datapoint').sort((a,b) => (a['factorX'] > b['factorX']) ? 1 : ((b['factorX'] > a['factorX']) ? -1 : 0));
    let sorted_sample = [...sample.all].map((e) => {e['sort_col'] = e[sample_dimensions[0].name] == sample_dimensions[0].focus ? sample_dimensions[0].focus : 'other'; return e});
    sorted_sample.sort((a,b) => (a['sort_col']  > b['sort_col']) ? 1 : ((b['sort_col'] > a['sort_col']) ? -1 : 0));
    let sample_datapoints = d3.permute(sorted_datapoints, sample_permute);
    let sample_permuted = d3.permute(sorted_sample, sample_permute);
    for(let i = 0; i < sample_length; i++){
        stage = new animStage('b_fade' + i, animation.name, stage_duration);

        for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
            let stat_marker = dynamic_elements.stat_markers[i];
            stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
        }
        let element = sample_datapoints[i];
        let element_id = element.getAttr('id');
        let matching_elements = static_elements.datapoints.all.filter((e)=>e.type=="datapoint" && e.getAttr('factorX')== element.getAttr('factorX') && e.getAttr('factorY')== element.getAttr('factorY'));
        let pop_element = matching_elements[Math.floor(Math.random() * matching_elements.length)];
        //pop_elements.push(pop_element);
        
        for(let n = 0; n < sample_length; n++){
            if(n == i) continue;
            let element = sample_datapoints[i];
            let element_id = element.getAttr('id');
            let matching_elements = static_elements.datapoints.all.filter((e)=>e.type=="datapoint" && e.getAttr('factorX')== element.getAttr('factorX') && e.getAttr('factorY')== element.getAttr('factorY'));
            let pop_element = matching_elements[Math.floor(Math.random() * matching_elements.length)];
            let fill = faded_in.includes(pop_element) ? 1 : 0;
            stage.setTransition(pop_element, 'fill-opacity', fill*0.5, fill*0.5, 0, 0);
            if(n >= i){
                stage.setTransition(element, 'fill-opacity', 0, 0, 0, 1);
                
                continue;
            }
            //pop_elements.push(pop_element);
            //stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
            stage.setTransition(element, 'y', element.getAttr('init_y'), element.getAttr('init_y'), 0, 1);
            stage.setTransition(element, 'fill-opacity', 0.5, 0.5, 0, 1);
            stage.setTransition(element, 'stroke-opacity', 0.5, 0.5, 0, 1);
            stage.setTransition(element, 'selected', n == i - 1 ? 1 : 0, 0, 0, 1);
        }
        stage.setTransition(element, 'y', !animate_points ? element.getAttr('init_y') : pop_element.getAttr('init_y'), element.getAttr('init_y'), 0, 1);
        stage.setTransition(element, 'x', !animate_points ? element.getAttr('init_x') : pop_element.getAttr('init_x'), element.getAttr('init_x'), 0, 1);
        stage.setTransition(element, 'fill-opacity', 0, 0.5, 0, 1);
        stage.setTransition(element, 'stroke-opacity', 0, 0.5, 0, 1);
        stage.setTransition(element, 'selected', 0, 1, 0, 1);
        if(!faded_in.includes(pop_element)){
            stage.setTransition(pop_element, 'fill-opacity', 0, 0.5, 0, 1);
            faded_in.push(pop_element);
        }
        stage.setFunc(()=>{
            if(!dd_showing) dd_toggle();
            dd_clearDatapoints({all: sample_permuted}, pop_dimensions, sample_dimensions);
            dd_updateSingleDatapoints({all: vis.dataset.all, permuted: sample_permuted}, pop_dimensions, sample_dimensions, sample_permute[i], i, false);
            let pop_elements = static_elements.datapoints.all.filter((e)=>e.type=="datapoint");
            for(let e = 0; e < pop_elements.length; e++){
                let pop_element = pop_elements[e];
                // pop_element.setAttr('fill-opacity', faded_in.includes(pop_element));
                //pop_element.setAttr('fill-opacity', 0);
            
            }
        });
        animation.addStage(stage);
        delayStage(animation, stage_duration);
    }

}
function prop_bootstrap_animate_points(animation, pop_dimensions, sample_dimensions, sample_index, dynamic_elements, static_elements, time, animate_points, sample_permute){
    let sample = vis.samples[sample_index];
    let sample_length = sample.all.length;
    let stage_duration = time / sample_length;
    let stage = new animStage('b_ani', animation.name, stage_duration);
    let faded_in = [];
    let sorted_datapoints = dynamic_elements.datapoints.all.filter((e)=> e.type == 'datapoint').sort((a,b) => (a['factorX'] > b['factorX']) ? 1 : ((b['factorX'] > a['factorX']) ? -1 : 0));
    let sorted_sample = [...sample.all].map((e) => {e['sort_col'] = e[sample_dimensions[0].name] == sample_dimensions[0].focus ? sample_dimensions[0].focus : 'other'; return e});
    sorted_sample.sort((a,b) => (a['sort_col']  > b['sort_col']) ? 1 : ((b['sort_col'] > a['sort_col']) ? -1 : 0));
    let sample_datapoints = d3.permute(sorted_datapoints, sample_permute);
    let sample_permuted = d3.permute(sorted_sample, sample_permute);
    for(let i = 0; i < vis.dataset.all.length; i++){
        stage = new animStage('b_ani' + i, animation.name, stage_duration);
        stage.setFunc(()=>{
            if(!dd_showing) dd_toggle();
            dd_clearDatapoints({all: sample_permuted}, pop_dimensions, sample_dimensions);
            dd_linkSingleDatapoint({all: vis.dataset.all, permuted: sample_permuted}, pop_dimensions, sample_dimensions, sample_permute[i], i, false);
        });
        for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
            let stat_marker = dynamic_elements.stat_markers[i];
            stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
        }
        // let pop_element_data = vis.dataset.all[i];
        // let element_id = pop_element_data.id;
        // let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        // let sample_elements = dynamic_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id);
        // for(let n = 0; n < sample_length; n++){
        //     let element = dynamic_elements.datapoints.all[sample_permute[n]];


        //     let fill = sample_elements.includes(element) ? 1 : 0;
        //     stage.setTransition(element, 'fill-opacity', 0, fill, 0, 0.3);
        //     stage.setTransition(element, 'selected', 0, fill, 0, 0.3);
        // }
        // for(let n = 0; n < static_elements.datapoints.all.length; n++){
        //     let pe = static_elements.datapoints.all[n];
        //     let fill = pe.getAttr('id') == element_id ? 1 : 0;
        //     stage.setTransition(pe, 'fill-opacity', 0, fill, 0, 0.3);
        //     stage.setTransition(pe, 'selected', 0, fill, 0, 0.3);
        // }
        animation.addStage(stage);
        delayStage(animation, stage_duration);
    }

}

function point_fade_stage(static_elements, dynamic_elements, stage, sample_index, stat_mark = true){
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
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index, stat_mark);
    
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 0, 0, 1);
    }

    let dimensions = model.getSampleDimensions();

    if(dimensions.length > 1 && dimensions[1].type == 'numeric'){
        let distribution_slopes = dynamic_elements.all.filter((e)=>e.id == "dist_stat_lineline");
        for(let i = 0; i < distribution_slopes.length; i++){
            stage.setTransition(distribution_slopes[i], 'stroke-opacity', 0, i == distribution_slopes.length -1 ? 0.2 : 0.2, 0, 0);
        }
    }
}
function randomisation_point_fade(static_elements, dynamic_elements, stage, sample_index){
    let pop_elements = [];
    let delay = 1/dynamic_elements.datapoints.all.length;
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        pop_elements.push(pop_element);
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
        stage.setTransition(element, 'fill-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'stroke-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'selected', 0, 1, 0, 1);
        stage.setTransition(element, "fill-color", element.getAttr("init_fill-color"), pop_element.getAttr("init_fill-color"), 0, 0.2);
        stage.setTransition(element, "stroke-color", element.getAttr("init_stroke-color"), pop_element.getAttr("init_stroke-color"), 0, 0.2);
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
        stage.setTransition(element, 'fill-opacity', 0, fill*0.5, delay*elem_counter, delay*(elem_counter+1));
        stage.setTransition(element, 'stroke-opacity', 0, fill*0.5, delay*elem_counter, delay*(elem_counter+1));
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
        stage.setTransition(dyn_element, 'fill-opacity', 0, 0.5, delay*elem_counter, delay*(elem_counter+1));
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

function point_skip_drop(static_elements, dynamic_elements, stage, sample_index, stat_mark = true){
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
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index, stat_mark);
    
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
function point_skip_drop_ci_range(static_elements, dynamic_elements, stage, sample_index){
    let range_bar = dynamic_elements.distribution.stats[sample_index].filter((e) => e.id.includes("dist_stat_range"))[0];
    let range_bar_stay = dynamic_elements.distribution.stats[sample_index].filter((e) => e.id.includes("dist_stat_stay"))[0];
    stage.setTransition(range_bar, "stroke-opacity", 0, 1, 0, 1);
    stage.setTransition(range_bar, "opacity", 0, 1, 0, 1);
    stage.setTransition(range_bar, "selected", 0, 1, 0, 0);
    stage.setTransition(range_bar, "lineWidth", 1, 3, 0, 0);
    stage.setTransition(range_bar_stay, "stroke-opacity", 0, 1, 0, 1);
    stage.setTransition(range_bar_stay, "opacity", 0, 1, 0, 1);
    stage.setTransition(range_bar_stay, "selected", 0, 1, 0, 0);
    stage.setTransition(range_bar_stay, "lineWidth", 1, 3, 0, 0);
    stage.setFunc(function(){
        if(!dynamic_elements.all.includes(range_bar)) dynamic_elements.all.push(range_bar);
        if(!dynamic_elements.all.includes(range_bar_stay)) dynamic_elements.all.push(range_bar_stay);
    });
}


function prop_fade_stage(static_elements, dynamic_elements, stage, sample_index, stat_mark = true){
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        let fill = element.type == 'datapoint' ? 0 : 1;
        stage.setTransition(element, 'fill-opacity', (!fill)*0.5, fill, 0, 1);
        stage.setTransition(element, 'stroke-opacity', !fill, fill, 0, 1);
    }
    element = dynamic_elements.stat_markers[0];
    stage.setTransition(element, 'fill-opacity', 0, 1, 0, 1);
    stage.setTransition(element, 'stroke-opacity', 0, 1, 0, 1);
    stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index, stat_mark);
    for(let i = 0; i < dynamic_elements.stat_markers.length; i++){
        let stat_marker = dynamic_elements.stat_markers[i];
        stage.setTransition(stat_marker, 'stroke-opacity', 0, 1, 0.5, 1);
    }
}

function stat_mark_fade_in(static_elements, dynamic_elements, stage, sample_index, show_stat_mark = true){
    for(let i = 0; i < dynamic_elements.ghosts.length; i++){
        let element = dynamic_elements.ghosts[i];
        
        let y1 = element.getAttr('init_y1');
        let y2 = element.getAttr('init_y2');
        let x1 = element.getAttr('init_x1');
        let x2 = element.getAttr('init_x2');
        if(element.id.includes("range") || !show_stat_mark){
            stage.setTransition(element, 'fill-opacity', 0, 0, 0, 1);
            stage.setTransition(element, 'stroke-opacity', 0, 0, 0, 1);
        }else{
            stage.setTransition(element, 'fill-opacity', 0.2, 0.2, 0, 1);
            stage.setTransition(element, 'stroke-opacity', 0.2, 0.2, 0, 1);
        }

        stage.setTransition(element, 'selected', 0, 0, 0, 1);
        stage.setTransition(element, 'lineWidth', 1, 1, 0, 1);
        if(x1 != x2) continue;
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
function point_drop_cirange_stage(static_elements, dynamic_elements, stage, sample_index){
    let range_bar = dynamic_elements.distribution.stats[sample_index].filter((e) => e.id.includes("dist_stat_range"))[0];
    let range_bar_stay = dynamic_elements.distribution.stats[sample_index].filter((e) => e.id.includes("dist_stat_stay"))[0];
    stage.setTransition(range_bar, "stroke-opacity", 0, 1, 0.8, 1);
    stage.setTransition(range_bar, "opacity", 0, 1, 0.8, 1);
    stage.setTransition(range_bar, "selected", 0, 1, 0.8, 0);
    stage.setTransition(range_bar, "lineWidth", 1, 3, 0.8, 0);
    stage.setTransition(range_bar_stay, "stroke-opacity", 0, 1, 0.8, 1);
    stage.setTransition(range_bar_stay, "opacity", 0, 1, 0.8, 1);
    stage.setTransition(range_bar_stay, "selected", 0, 1, 0, 0);
    stage.setTransition(range_bar_stay, "lineWidth", 1, 3, 0, 0);
    stage.setFunc(function(){
        if(!dynamic_elements.all.includes(range_bar)) dynamic_elements.all.push(range_bar);
        if(!dynamic_elements.all.includes(range_bar_stay)) dynamic_elements.all.push(range_bar_stay);
    });
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
function prop_point_drop_cirange_stage(static_elements, dynamic_elements, stage, sample_index, selected_elements){
    let range_bar = dynamic_elements.distribution.stats[sample_index].filter((e) => e.id.includes("dist_stat_range"))[0];
    let range_bar_stay = dynamic_elements.distribution.stats[sample_index].filter((e) => e.id.includes("dist_stat_stay"))[0];
    stage.setTransition(range_bar, "stroke-opacity", 0, 1, 0, 1);
    stage.setTransition(range_bar, "opacity", 0, 1, 0, 1);
    stage.setTransition(range_bar, "selected", 0, 1, 0, 0);
    stage.setTransition(range_bar, "lineWidth", 1, 3, 0, 0);
    stage.setTransition(range_bar_stay, "stroke-opacity", 0, 1, 0, 1);
    stage.setTransition(range_bar_stay, "opacity", 0, 1, 0, 1);
    stage.setTransition(range_bar_stay, "selected", 0, 1, 0, 0);
    stage.setTransition(range_bar_stay, "lineWidth", 1, 3, 0, 0);
    stage.setFunc(function(){
        if(!dynamic_elements.all.includes(range_bar)) dynamic_elements.all.push(range_bar);
        if(!dynamic_elements.all.includes(range_bar_stay)) dynamic_elements.all.push(range_bar_stay);
    });
}

function point_center_drop_stage(static_elements, dynamic_elements, stage){
    let middle_y = vis.areas['sec1display'].innerTop + vis.areas['sec1display'].innerHeight/2;
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), middle_y, 0, 0.75);
        stage.setTransition(element, 'fill-color', pop_element.getAttr("init_fill-color"), element.getAttr("init_fill-color"), 0.75, 1);
        stage.setTransition(element, 'stroke-color', pop_element.getAttr("init_stroke-color"), element.getAttr("init_stroke-color"), 0.75, 1);
    }

}
function point_center_skip_drop_stage(static_elements, dynamic_elements, stage, sample_index){
    let middle_y = vis.areas['sec1display'].innerTop + vis.areas['sec1display'].innerHeight/2;
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), middle_y, 0, 0);
        stage.setTransition(element, 'fill-color', pop_element.getAttr("init_fill-color"), element.getAttr("init_fill-color"), 0.75, 1);
        stage.setTransition(element, 'stroke-color', pop_element.getAttr("init_stroke-color"), element.getAttr("init_stroke-color"), 0.75, 1);
        stage.setTransition(element, 'fill-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'stroke-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'selected', 0, 1, 0, 1);
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
function dist_drop_point_cirange_stage(static_elements, dynamic_elements, stage, sample_index, numeric){
    let range_bar = dynamic_elements.distribution.stats[sample_index].filter((e) => e.id.includes("dist_stat_range"))[0];
    let dist_elem = dynamic_elements.distribution.datapoints[sample_index];
    stage.setTransition(range_bar, 'x1', range_bar.getAttr('init_x1'), dist_elem.getAttr('init_ci_min'), 0, 1);
    stage.setTransition(range_bar, 'x2', range_bar.getAttr('init_x2'), dist_elem.getAttr('init_ci_max'), 0, 1);
    stage.setTransition(range_bar, 'y1', range_bar.getAttr('init_y1'), dist_elem.getAttr('init_y'), 0, 1);
    stage.setTransition(range_bar, 'y2', range_bar.getAttr('init_y2'), dist_elem.getAttr('init_y'), 0, 1);
    stage.setTransition(range_bar, 'selected', 1, 0, 0, 1);
    stage.setTransition(range_bar, 'stroke-color', "orange", dist_elem.getAttr('in_ci') ? "green" : "red", 0, 1);
    stage.setTransition(dist_elem, 'stroke-opacity', 0, 1, 0.8, 1);
    stage.setTransition(dist_elem, 'fill-opacity', 0, 1, 0.8, 1);

    if(numeric) {
        for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
            let element = dynamic_elements.datapoints.all[i];
            stage.setTransition(element, 'selected', 1, 0, 0, 0);
        }
    }
    let total_count = 0;
    let in_count = 0;
    for(let j = 0; j < sample_index; j++){
        let elements_to_fit = 40;
        let bottom_index = Math.max(sample_index - elements_to_fit, 0);
        let index = j - bottom_index;
        let last_bottom_index = Math.max(sample_index - 1 - elements_to_fit, 0);
        let last_index = j - last_bottom_index;
        let d_element = dynamic_elements.distribution.datapoints[j];
        let new_y = d_element.calcLineHeapY(index);
        let old_y = d_element.calcLineHeapY(last_index);
        stage.setTransition(d_element, 'y', old_y, new_y, 0, 1);
        if(d_element.getAttr('in_ci')) in_count++;
        total_count++;
    }
    let old_text = `${in_count} / ${total_count}`;
    let old_percent_text = `${Math.round(in_count / total_count * 10000)/100}%`;
    if(dist_elem.getAttr('in_ci')) in_count++;
    total_count++;
    let new_text = `${in_count} / ${total_count}`;
    let new_percent_text = `${Math.round(in_count / total_count * 10000)/100}%`;
    let textbox = static_elements.ontop.filter((e) => String(e.id).includes('range_textbox'))[0];
    if(textbox){
        stage.setTransition(textbox, 'text', old_text, new_text, 0.5 , 0.5);
        stage.setTransition(textbox, 'percentage-text', old_percent_text, new_percent_text, 0.5 , 0.5);
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
    stage.setTransition(stat_marker, 'y1', stat_marker.getAttr('init_y1'), dist_elem.getAttr('init_y'), 0.2, 1);
    stage.setTransition(stat_marker, 'y2', stat_marker.getAttr('init_y2'), dist_elem.getAttr('init_y'), 0.2, 1);
    stage.setTransition(stat_marker, 'x1', stat_marker.getAttr('init_x1'), vis.areas["sec2display"].innerLeft + vis.areas["sec2display"].innerWidth/2, 0.2,  1);
    stage.setTransition(stat_marker, 'x2', stat_marker.getAttr('init_x2'), dist_elem.getAttr('init_x'), 0.2, 1);
    stage.setTransition(stat_marker, 'selected', 0, 1, 0, 0.1);
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
    let length = 3000;
    stage = new animStage('dist', animation.name, 10);
    if(module.name == "Bootstrapping"){
        stage.setFunc(()=>{
            if(!dd_showing) dd_toggle();
            dd_clearDatapoints({all: vis.samples[sample_index].all}, pop_dimensions, sample_dimensions);
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
            stage.setTransition(sample_mark, 'fill-opacity', 0, 0, 0, 0);
            if(x1 != x2){
                stage.setTransition(sample_mark, 'y1', y1, y1, 0, 0);
                stage.setTransition(sample_mark, 'y2', y2, y2, 0, 0);

            }else{

                stage.setTransition(sample_mark, 'y2', y2 + (y1-y2)/1.5, y2 + (y1-y2)/1.5, 0, 1);
            }
            
        }
        let dist_datapoint = dynamic_elements.distribution.datapoints[x];
        stage.setTransition(dist_datapoint, 'stroke-opacity', 0, 0, 0, 0);
        stage.setTransition(dist_datapoint, 'fill-opacity', 0, 0, 0, 0);
    }
    animation.addStage(stage);
    let step = 10;
    for(let i = 0; i < 1000; i += step){
        stage = new animStage('dist', animation.name, length / (1000 / step));
        stage.setFunc(function(){
            vis.dynamicElements.all = [];
            for(let n = 0; n < vis.dynamicElements.distribution.stats.length && n <= i; n++){
                vis.dynamicElements.all = vis.dynamicElements.all.concat(vis.dynamicElements.distribution.stats[n]);
                vis.dynamicElements.all = vis.dynamicElements.all.concat([vis.dynamicElements.distribution.datapoints[n]]);
            }
            vis.initSample(vis.samples[i], vis.dynamicElements.distribution.stats[i], false);
        });
        for(let j = i - step + 1; j <= i; j++ ){
            if(j < 0) continue;
            if(module.name != "Confidence Interval"){
                let sample_markers = dynamic_elements.distribution.stats[j];
                for(let n = 0; n < sample_markers.length; n++){
                    let sample_mark = sample_markers[n];
                    stage.setTransition(sample_mark, 'stroke-opacity', 0, 0.2, 0, 0);
                }
            }
            let dist_datapoint = dynamic_elements.distribution.datapoints[j];
            stage.setTransition(dist_datapoint, 'stroke-opacity', 0, 1, 0, 0.2);
            stage.setTransition(dist_datapoint, 'fill-opacity', 0, 1, 0, 0);
        }
        let range_bar = dynamic_elements.distribution.stats[i].filter((e) => String(e.id).includes('stay'))[0];
        if(range_bar){
            stage.setTransition(range_bar, 'stroke-opacity', 0, 1, 0, 0);
            stage.setTransition(range_bar, 'fill-opacity', 0, 1, 0, 0);
            stage.setTransition(range_bar, 'selected', 0, 1, 0, 0);
            stage.setTransition(range_bar, 'lineWidth', 1, 3, 0, 0);
        }
        if(i - step > 0){
            let last_range_bar = dynamic_elements.distribution.stats[i - step].filter((e) => String(e.id).includes('stay'))[0];
            if(range_bar){
                stage.setTransition(last_range_bar, 'stroke-opacity', 0, 0, 0, 0);
                stage.setTransition(last_range_bar, 'fill-opacity', 0, 0, 0, 0);
                stage.setTransition(last_range_bar, 'selected', 0, 0, 0, 0);
            }
        }
        if(dynamic_elements.distribution.datapoints[0].type == "distribution_range"){
            let total_count = 0;
            let in_count = 0;
            for(let j = 0; j < i; j++){
                let elements_to_fit = 40;
                let bottom_index = Math.max(i - elements_to_fit, 0);
                let index = j - bottom_index;
                let last_bottom_index = Math.max(i - 1 - elements_to_fit, 0);
                let last_index = j - last_bottom_index;
                let d_element = dynamic_elements.distribution.datapoints[j];
                let new_y = d_element.calcLineHeapY(index);
                let old_y = d_element.calcLineHeapY(last_index);
                stage.setTransition(d_element, 'y', old_y, new_y, 0, 1);
                if(d_element.getAttr('in_ci')) in_count++;
                total_count++;
            }
            let old_text = `${in_count} / ${total_count}`;
            let old_percent_text = `${Math.round(in_count / total_count * 10000)/100}%`;
            if(dynamic_elements.distribution.datapoints[i].getAttr('in_ci')) in_count++;
            total_count++;
            let new_text = `${in_count} / ${total_count}`;
            let new_percent_text = `${Math.round(in_count / total_count * 10000)/100}%`;
            let textbox = static_elements.ontop.filter((e) => String(e.id).includes('range_textbox'))[0];
            if(textbox){
                stage.setTransition(textbox, 'text', old_text, new_text, 0.5 , 0.5);
                stage.setTransition(textbox, 'percentage-text', old_percent_text, new_percent_text, 0.5 , 0.5);
            }
        }
        animation.addStage(stage);
    }
    return animation;
}

function ma_createCIAnimation(animation, pop_dimensions, sample_dimensions, static_elements, dynamic_elements, module, speed, sample_index, areas, largeCI){
    stage = new animStage('dist', animation.name, 200);
    stage.setFunc(function(){
        for(let i = 0; i < dynamic_elements.distribution.ci.length; i++){
            let ci_element = dynamic_elements.distribution.ci[i];
            for(let e = 0; e < Object.keys(ci_element.attrs).length; e++){
                let attr = Object.keys(ci_element.attrs)[e];
                if(attr.includes('init_large') && largeCI){
                    let attr_value = ci_element.getAttr(attr);
                    let replace_name = attr.split('_').slice(2).join('_');
                    ci_element.setAttr(replace_name, attr_value);
                }else if(attr.includes('init_') && !attr.includes('large_') && !largeCI){
                    let attr_value = ci_element.getAttr(attr);
                    let replace_name = attr.split('_').slice(1).join('_');
                    ci_element.setAttr(replace_name, attr_value);
                }
            }
        }  
    });
    let ci_num_line = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_num_line")[0];
    let ci_num_text = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_num_text")[0];
    animation.addStage(stage);
    if(sample_dimensions.length > 1 && sample_dimensions[1].type == 'categoric' && sample_dimensions[1].factors.length > 1){
        stage = new animStage('dist', animation.name, 1000);
        let text_margin = areas['sec2axis'].height;
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
        let ci_pop_stat_arrow = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_pop_stat_arrow")[0];
        let ci_pop_stat_text = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_pop_stat_text")[0];

        stage = new animStage('dist', animation.name, 1000);
        stage.setTransition(ci_pop_stat_arrow, 'stroke-opacity', 0, 1, 0, 1);
        stage.setTransition(ci_pop_stat_arrow, 'fill-opacity', 0, 1, 0, 1);
        stage.setTransition(ci_pop_stat_text, 'stroke-opacity', 0, 1, 0, 1);
        stage.setTransition(ci_pop_stat_text, 'fill-opacity', 0, 1, 0, 1);
        animation.addStage(stage);
        stage = new animStage('dist', animation.name, 1000);
        stage.setTransition(ci_pop_stat_arrow, 'x1', ci_pop_stat_arrow.getAttr('init_x1'), ci_pop_stat_arrow.getAttr('dist_x1'), 0, 1);
        stage.setTransition(ci_pop_stat_arrow, 'x2', ci_pop_stat_arrow.getAttr('init_x2'), ci_pop_stat_arrow.getAttr('dist_x2'), 0, 1);
        stage.setTransition(ci_pop_stat_text, 'x', ci_pop_stat_text.getAttr('init_x'), sample_dimensions[1].factors.length > 2 ? (ci_pop_stat_arrow.getAttr('dist_x1') + ci_pop_stat_arrow.getAttr('dist_x2')) / 2 : ci_pop_stat_arrow.getAttr('dist_x2'), 0, 1);
        stage.setTransition(ci_pop_stat_arrow, 'y1', ci_pop_stat_arrow.getAttr('init_y1'), areas['sec2display'].bottom, 0, 1);
        stage.setTransition(ci_pop_stat_arrow, 'y2', ci_pop_stat_arrow.getAttr('init_y2'), areas['sec2display'].bottom, 0, 1);
        stage.setTransition(ci_pop_stat_text, 'y', ci_pop_stat_text.getAttr('init_y'), areas['sec2display'].bottom + (sample_dimensions[1].factors.length > 2 ? 0 : (text_margin / 1.5)), 0, 1);
        //stage.setTransition(ci_pop_stat_text, 'alignment-baseline', 'hanging', 0, 1);
        animation.addStage(stage);
        stage = new animStage('dist', animation.name, 1000);
        for(let i = 0; i < dynamic_elements.distribution.ci.length; i++){
            let dist_datapoint = dynamic_elements.distribution.ci[i];
            if(dist_datapoint == ci_pop_stat_arrow || dist_datapoint == ci_pop_stat_text || dist_datapoint == ci_num_line || dist_datapoint == ci_num_text) continue;
            stage.setTransition(dist_datapoint, 'stroke-opacity', 0, 1, 0, 1);
            stage.setTransition(dist_datapoint, 'fill-opacity', 0, 1, 0, 1);
        }
        animation.addStage(stage);
        
    }else{
        stage = new animStage('dist', animation.name, 1000);
        let text_margin = areas['sec2axis'].height;
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
        stage = new animStage('dist', animation.name, 1000);
        let cross_bar = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_cross_bar")[0];
        let cross_bar_mid = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_cross_bar_mid")[0];
        let cross_bar_top = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_cross_bar_top")[0];
        let ci_min = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_min")[0];
        let ci_max = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_max")[0];
        let ci_min_text = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_min_text")[0];
        let ci_max_text = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_max_text")[0];
        let ci_min_top = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_min_top")[0];
        let ci_max_top = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_max_top")[0];
        let ci_min_text_top = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_min_text_top")[0];
        let ci_max_text_top = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_max_text_top")[0];
        stage.setTransition(cross_bar_mid, 'y1', cross_bar.getAttr('y1'), areas['sec1display'].split(8, 7)[1], 0, 1);
        stage.setTransition(cross_bar_mid, 'y2', cross_bar.getAttr('y2'), areas['sec1display'].split(8, 7)[1], 0, 1);
        stage.setTransition(cross_bar_top, 'y1', cross_bar.getAttr('y1'), areas['sec1display'].split(8, 7)[1], 0, 1);
        stage.setTransition(cross_bar_top, 'y2', cross_bar.getAttr('y2'), areas['sec1display'].split(8, 7)[1], 0, 1);
        stage.setTransition(ci_min_top, 'y1', ci_min.getAttr('y1'), areas['sec1display'].split(8, 7)[1], 0, 1);
        stage.setTransition(ci_min_top, 'y2', ci_min.getAttr('y2'), areas['sec1display'].split(8, 8)[1], 0, 1);
        stage.setTransition(ci_max_top, 'y1', ci_max.getAttr('y1'), areas['sec1display'].split(8, 7)[1], 0, 1);
        stage.setTransition(ci_max_top, 'y2', ci_max.getAttr('y2'), areas['sec1display'].split(8, 8)[1], 0, 1);
        stage.setTransition(ci_min_text_top, 'y', ci_min_text.getAttr('y'), areas['sec1display'].split(8, 8)[1], 0, 1);
        stage.setTransition(ci_max_text_top, 'y', ci_max_text.getAttr('y'), areas['sec1display'].split(8, 8)[1], 0, 1);
        animation.addStage(stage);
        stage = new animStage('dist', animation.name, 1000);
        stage.setTransition(cross_bar_top, 'y1', areas['sec1display'].split(8, 7)[1], areas['sec0display'].split(8, 7)[1], 0, 1);
        stage.setTransition(cross_bar_top, 'y2', areas['sec1display'].split(8, 7)[1], areas['sec0display'].split(8, 7)[1], 0, 1);
        stage.setTransition(ci_min_top, 'y1', areas['sec1display'].split(8, 7)[1], areas['sec0display'].split(8, 7)[1], 0, 1);
        stage.setTransition(ci_min_top, 'y2', areas['sec1display'].split(8, 8)[1], areas['sec0display'].split(8, 8)[1], 0, 1);
        stage.setTransition(ci_max_top, 'y1', areas['sec1display'].split(8, 7)[1], areas['sec0display'].split(8, 7)[1], 0, 1);
        stage.setTransition(ci_max_top, 'y2', areas['sec1display'].split(8, 8)[1], areas['sec0display'].split(8, 8)[1], 0, 1);
        stage.setTransition(ci_min_text_top, 'y', areas['sec1display'].split(8, 8)[1], areas['sec0display'].split(8, 8)[1] + text_margin, 0, 1);
        stage.setTransition(ci_max_text_top, 'y', areas['sec1display'].split(8, 8)[1], areas['sec0display'].split(8, 8)[1] + text_margin, 0, 1);
        animation.addStage(stage);
         
    }

    return animation;
}
function ma_createRandTestCIAnimation(animation, pop_dimensions, sample_dimensions, static_elements, dynamic_elements, module, speed, sample_index, areas, largeCI){
    stage = new animStage('dist', animation.name, 200);
    stage.setFunc(function(){
        for(let i = 0; i < dynamic_elements.distribution.ci.length; i++){
            let ci_element = dynamic_elements.distribution.ci[i];
            for(let e = 0; e < Object.keys(ci_element.attrs).length; e++){
                let attr = Object.keys(ci_element.attrs)[e];
                if(attr.includes('init_large') && largeCI){
                    let attr_value = ci_element.getAttr(attr);
                    let replace_name = attr.split('_').slice(2).join('_');
                    ci_element.setAttr(replace_name, attr_value);
                }else if(attr.includes('init_') && !attr.includes('large_') && !largeCI){
                    let attr_value = ci_element.getAttr(attr);
                    let replace_name = attr.split('_').slice(1).join('_');
                    ci_element.setAttr(replace_name, attr_value);
                }
            }
        }  
    });
    animation.addStage(stage);
    stage = new animStage('dist', animation.name, 1000);
    let text_margin = areas['sec2axis'].height;
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
    let ci_pop_stat_arrow = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_pop_stat_arrow")[0];
    let ci_pop_stat_text = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_pop_stat_text")[0];
    let ci_num_line = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_num_line")[0];
    let ci_num_text = dynamic_elements.distribution.ci.filter((e) => e.id == "ci_num_text")[0];

    stage = new animStage('dist', animation.name, 1000);
    stage.setTransition(ci_pop_stat_arrow, 'stroke-opacity', 0, 1, 0, 1);
    stage.setTransition(ci_pop_stat_arrow, 'fill-opacity', 0, 1, 0, 1);
    stage.setTransition(ci_pop_stat_text, 'stroke-opacity', 0, 1, 0, 1);
    stage.setTransition(ci_pop_stat_text, 'fill-opacity', 0, 1, 0, 1);

    animation.addStage(stage);
    stage = new animStage('dist', animation.name, 1000);
    stage.setTransition(ci_pop_stat_arrow, 'x1', ci_pop_stat_arrow.getAttr('init_x1'), ci_pop_stat_arrow.getAttr('dist_x1'), 0, 1);
    stage.setTransition(ci_pop_stat_arrow, 'x2', ci_pop_stat_arrow.getAttr('init_x2'), ci_pop_stat_arrow.getAttr('dist_x2'), 0, 1);
    stage.setTransition(ci_pop_stat_text, 'x', ci_pop_stat_text.getAttr('init_x'), sample_dimensions[1].factors.length > 2 ? (ci_pop_stat_arrow.getAttr('dist_x1') + ci_pop_stat_arrow.getAttr('dist_x2')) / 2 : ci_pop_stat_arrow.getAttr('dist_x2'), 0, 1);
    stage.setTransition(ci_pop_stat_arrow, 'y1', ci_pop_stat_arrow.getAttr('init_y1'), areas['sec2display'].bottom, 0, 1);
    stage.setTransition(ci_pop_stat_arrow, 'y2', ci_pop_stat_arrow.getAttr('init_y2'), areas['sec2display'].bottom, 0, 1);
    stage.setTransition(ci_pop_stat_text, 'y', ci_pop_stat_text.getAttr('init_y'), areas['sec2display'].bottom + (sample_dimensions[1].factors.length > 2 ? 0 : (text_margin / 1.5)), 0, 1);
    //stage.setTransition(ci_pop_stat_text, 'alignment-baseline', 'hanging', 0, 1);
    animation.addStage(stage);

    stage = new animStage('dist', animation.name, 1000);
    stage.setTransition(ci_num_line, 'stroke-opacity', 0, 1, 0, 1);
    stage.setTransition(ci_num_line, 'fill-opacity', 0, 1, 0, 1);
    stage.setTransition(ci_num_line, 'selected', 0, 1, 0, 0);
    stage.setTransition(ci_num_text, 'stroke-opacity', 0, 1, 0, 1);
    stage.setTransition(ci_num_text, 'fill-opacity', 0, 1, 0, 1);
    stage.setTransition(ci_num_text, 'selected', 0, 1, 0, 0);
    animation.addStage(stage);
    
    

    return animation;
}