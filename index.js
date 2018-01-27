let user_changed_options = {};

// Called when the site first loads, starts app.
window.onload = function(){

    // Load html for the user specified module (in url)
    // or the home screen if none specified.
    controller.loadModule(getURLParameter(window.location.href, 'module') 
                            || "Home");
    
    // Check for a file to fast load.
    let file_param = getURLParameter(window.location.href, 'file');
    if(file_param){

        // If a file is given by the user, start loading it.
        fastLoad(file_param);
    }
};

async function fastLoad(file_param){

    // Prefix is the type of file, E.G a preset on the server
    // or a url.
    // file_name is a url for a url file.
    let [prefix, file_name] = file_param.split(':');
    if(prefix == 'preset'){
        let p = await model.getExampleFile(file_name);
    }else if(prefix == 'url'){
        let p = await model.getUrlFile(file_name);
    }

    model.formatData();

    // check for variables:
    let [d0, d1] = [getURLParameter(window.location.href, 'd0'),
                    getURLParameter(window.location.href, 'd1')];
    if(d0){

        // If the user has set variables, check they are valid
        // and set them.
        let columns = [d0.slice(0, d0.length-4)];
        if(d1) columns.push(d1.slice(0, d1.length-4));
        model.columnSelection(columns);
        controller.validateSelectedColumns();
        controller.fileParsed();
        
    }else{

        // If no variable options are set, return to file select UI.
        controller.fileParsed();
        return;
    }
    

    if(model.dimensions[0].factors.length > 1){

        // If the first dimension has more than 1 category
        // We need one to focus on.
        let focus = getURLParameter(window.location.href, 'focus');
        if(focus){

            // If the user has set a focus, load it and file select is done.
            controller.gotoOption();
        }else{

            // If the user has not set a focus, return to file select UI.
            return;
        }
    }else{

        // If no focus is needed, file select is done.
        controller.gotoOption(); 
    }

    // Get any user specified options E.G sample size.
    let options = JSON.parse(getURLParameter(window.location.href, 'options'));
    if(options){

        // If there are options set, they need to be validated.
        let all_url_options_valid = true;
        for(let o in options){
            let m_option = model.selected_module.options.filter(
                                (e)=>(e.name == o)
                            )[0];
            all_url_options_valid = all_url_options_valid &&
                                    m_option.validate(options[o], m_option);
        }

        // If all options are valid, we can take samples and show the vis screen.
        if(all_url_options_valid) controller.takeSamples();
    }

}