function ma_createAnimation(animation, static_elements, dynamic_elements, module){
    let stage = new animStage('test2', animation.name, 5000);
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        stage.setTransition(element, 'y', element.getAttr('init_y'), 300, 0, 1);
    }
    animation.addStage(stage);
    stage = new animStage('test', animation.name, 5000);
    for(let i = 0; i < dynamic_elements.datapoints.all.length; i++){
        let element = dynamic_elements.datapoints.all[i];
        stage.setTransition(element, 'x', element.getAttr('init_x'), 300, 0, 1);
    }
    animation.addStage(stage);

    
}