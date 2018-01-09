function ma_createAnimation(animation, pop_dimensions, sample_dimensions, static_elements, dynamic_elements, module, speed){
    let stage = null;
    if(pop_dimensions[0].type == 'numeric'){
        stage = new animStage('fade', animation.name, 5000/speed);
        point_fade_stage(static_elements, dynamic_elements, stage);
        animation.addStage(stage);

        stage = new animStage('drop', animation.name, 5000/speed);
        point_drop_stage(static_elements, dynamic_elements, stage);
        animation.addStage(stage);
    }
    
    stage = new animStage('test', animation.name, 5000/speed);
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        stage.setTransition(element, 'x', element.getAttr('init_x'), 300, 0, 1);
    }
    animation.addStage(stage);

    
}

function point_fade_stage(static_elements, dynamic_elements, stage){
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), pop_element.getAttr('init_y'), 0, 1);
        stage.setTransition(element, 'fill-opacity', 0, 1, 0, 1);
        stage.setTransition(element, 'stroke-opacity', 0, 1, 0, 1);
    }
}

function point_drop_stage(static_elements, dynamic_elements, stage){
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        let element_id = element.getAttr('id');
        let pop_element = static_elements.datapoints.all.filter((e)=>e.getAttr('id')== element_id)[0];
        stage.setTransition(element, 'y', pop_element.getAttr('init_y'), element.getAttr('init_y'), 0, 1);
    }
}