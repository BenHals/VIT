let user_changed_options = {};

window.onload = function(){

    controller.loadModule(getURLParameter(window.location.href, 'module') || "Home");
    
    // Check for a file to fast load
    let file_param = getURLParameter(window.location.href, 'file');
    if(file_param){
        fastLoad(file_param);
    }
};

async function fastLoad(file_param){
    console.log(window.location.href, file_param);
    let [prefix, file_name] = file_param.split(':');
    console.log(prefix, file_name);
    if(prefix == 'preset'){
        let p = await model.getExampleFile(file_name);
    }else if(prefix == 'url'){
        let p = await model.getUrlFile(file_name);
    }

    model.formatData();
    // check for variables:
    let [d0, d1] = [getURLParameter(window.location.href, 'd0'), getURLParameter(window.location.href, 'd1')];
    if(d0){
        let columns = [d0.slice(0, d0.length-4)];
        if(d1) columns.push(d1.slice(0, d1.length-4));
        model.columnSelection(columns);
        controller.validateSelectedColumns();
        controller.fileParsed();
        
    }else{
        controller.fileParsed();
        return;
    }
    

    if(model.dimensions[0].factors.length > 1){
        // check for focus
        let focus = getURLParameter(window.location.href, 'focus');
        if(focus){
            controller.gotoOption();
        }else{
            return;
        }
    }else{
        controller.gotoOption(); 
    }

    let options = JSON.parse(getURLParameter(window.location.href, 'options'));
    console.log(options);
    if(options){
        let all_url_options_valid = true;
        for(let o in options){
            let m_option = model.selected_module.options.filter((e)=>(e.name == o))[0];
            all_url_options_valid = all_url_options_valid && m_option.validate(options[o], m_option);
        }
        if(all_url_options_valid) controller.takeSamples();
    }

}