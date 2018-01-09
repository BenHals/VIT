const controller = {
    paused: false,
    loadModule: function(module_name){ 
        let selected_module = config.modules[module_name];
        // Set the current selected module.
        model.setSelectedModule(selected_module);
        // Get the view to switch to the new module.
        view.switchModule(selected_module.baseHTML(selected_module.name), selected_module.baseControls);
        // Set our url parameter to reload here.
        updateUrl('module', module_name);
    },

    localFileSelected: function(file){
        // New file, so want to clean up url.
        deleteFromUrl(['file','d0','d1','focus', 'statistic', 'ss']);
        model.getLocalFile(file);
        this.fileParsed();
    },

    urlFileSelected: async function(url){
        let self = this;
        // New file, so want to clean up url.
        deleteFromUrl(['file','d0','d1','focus', 'statistic', 'ss']);
        model.getUrlFile(url).then((val)=>{
            // Save file details in url for reloading. Needs formatting.
            let parameters = {};
            let parameterSplit = url.split("?");
            parameterSplit = parameterSplit.length > 1 ? parameterSplit[1] : [];
            if(parameterSplit.length > 0){
                parameterSplit = parameterSplit.split('&');
                for(let pIndex = 0; pIndex < parameterSplit.length; pIndex++){
                    let keyValue = parameterSplit[pIndex].split('=');
                    parameters[keyValue[0]] = keyValue[1];
                }
            }
            var paramString = "";
            for(let param in parameters){
                paramString += param+":"+parameters[param]+"-";
            }
            updateUrl('file', "url:"+url);
            updateUrl('urlParams', paramString);
            self.fileParsed();
        }, (err) =>{
            fc_urlError(err);
        });
    },

    exampleFileSelected: async function(filename){
        let self = this;
        // New file, so want to clean up url.
        deleteFromUrl(['file','d0','d1','focus', 'statistic', 'ss']);
        model.getExampleFile(filename).then((val)=>{
            // Save file details in url for reloading. Needs formatting.
            updateUrl('file', "preset:"+filename);
            self.fileParsed();
        }, (err) =>{
            fc_exampleError(err);
        });
    },

    fileParsed: function(){
        model.formatData().then((val)=>{
            let columns = model.getColumnNamesTypes();
            let selected_columns = model.getSelectedColumns();
            fc_populateColumnSelect(columns, selected_columns);
        }, (err) =>{
            fc_formatError(err);
        });
    },

    columnSelected: function(e){
        model.newColumnReset();
        // Reset URL
        deleteFromUrl(['d0', 'd1', 'focus']);
  
        let selected_labels = [...Array.prototype.slice.call(e.target.selectedOptions)].map(function(option){return option.innerText.slice(0, option.innerText.length-4)});
        model.columnSelection(selected_labels);
        this.validateSelectedColumns();


    },

    validateSelectedColumns: function(){
        let selected_columns = model.getSelectedColumns();
        // Can only handle 2 dimentional data right now.
        if(selected_columns.length > 2){
            fc_tooManyVariables();
            return;
        }
    
        let tempDimensions = [];
        for(let i in selected_columns){
            let column = selected_columns[i];
            let c_name = column.name;
            let c_type = column.type.slice(0, 1);
            tempDimensions.push({name:c_name, type:c_type});
    

        }
    
        // Check if the selected variables are allowed for the selected module (randomisation variation 
        // cant take a second dimension for example).
        var selectedTypes = [tempDimensions[0].type, tempDimensions[1] ? tempDimensions[1].type : null];
        if(!model.selected_module.allowedVariables.some(function(element){return element[0] == selectedTypes[0] && element[1] == selectedTypes[1]})){
            fc_wrongModule();
            return;
        }

        model.setDimensions();
        tempDimensions.forEach((d, i)=>{
            // Set our url parameter to reload here.
            updateUrl('d'+i, `${d.name} (${d.type})`);
        });

        // If the first dimension is categorical, create the focus selector
        if(model.dimensions[0].type == 'categoric'){
            let factors = model.getDimensionFactors()[0];
            let focus = model.getDimensionFocus()[0];
            updateUrl('focus', focus);
            fc_populateFocus(factors, focus);
            model.setDimensionFocus(focus, 0);
        }

        
        this.doneSetup();
    },

    focusSelected: function(e){
        var focus = [...e.target.selectedOptions].map(function(option){return option.innerText})[0];
        updateUrl('focus', focus);
        model.setDimensionFocus(focus, 0);

        this.doneSetup();
    },
    ddResized: function(dd_width){
        let total_space = $("#display").innerWidth();
        let vis_space = total_space - dd_width;
        this.resizeVis(vis_space, $("#display").innerHeight());
    },
    resizeVis: function(width, height){
        view.resizeCanvas();
    },
    doneSetup: function(){
        let ds = model.populationDataset();
        view.loadDataDisplay(ds);
        view.loadCanvas();
        fc_showContinue();
        vis.init();
        vis.initModule(model.selected_module, model.getOptions());
        vis.initDimensions(model.dimensions, model.getSampleDimensions());
        vis.initOptions(model.getOptions());
        vis.initPreview(ds);
    },
    gotoOption: function(){
        view.loadControls(generateOptionControls);
        let required_options = model.selected_module.options;
        oc_populateOptions(required_options);
    },
    optionBack: function(){
        view.loadControls(generateFileControls);
        let columns = model.getColumnNamesTypes();
        let selected_columns = model.getSelectedColumns();
        fc_populateColumnSelect(columns, selected_columns.map((col)=> col.name));

        if(model.dimensions[0].type == 'categoric'){
            let factors = model.getDimensionFactors()[0];
            let focus = model.getDimensionFocus()[0];
            fc_populateFocus(factors, focus);
        }
        
    },

    setOption: function(o, new_val){
        model.setOption(o.name, new_val);
    },
    takeSamples: async function() {
        let required_options = model.selected_module.options;
        let is_valid = true;
        for(let o in required_options){
            is_valid = is_valid && required_options[o].is_valid;
        }
        if(!is_valid) return false;
        this.gotoAni();
        let [samples, distribution] = [null, null];
        model.takeSamples();
        // let p = await model.takeSamples().then((data) => {
        //     [samples, distribution] = data;
        // });
        
        // let ds = model.populationDataset();
        // vis.initOptions(model.getOptions());
        // vis.initPopulation(ds);
        // vis.initSamples(samples, distribution);
        
    },
    gotoAni: function(){
        view.loadControls(generateAniControls);
    },
    updateSampleProgress: function(p){
        ac_updateProgress(p);
        if(model.samples.length == 1000){
            ac_loadingDone();
            let ds = model.populationDataset();
            vis.initOptions(model.getOptions());
            vis.initPopulation(ds);
            vis.initSamples(model.samples, model.distribution);
        }
    },
    aniBack: function(){
        this.gotoOption();
    },
    visAnimUserInput: function(new_progress){
        console.log(new_progress);
        if(vis.animation){
            console.log(vis.animation.progress_percent(new_progress));
            vis.setProgress(new_progress);
        } 
    },
    initAnimation: function(num_samples, include_distribution){
        console.log(num_samples +":"+include_distribution);
        vis.initAnimation(num_samples, include_distribution);
    }, 
    pause: function(){
        this.paused = true;
        vis.pause();
        ac_pause();
    },
    unpause: function(){
        this.paused = false;
        vis.unpause();
        ac_unpause();
    },
    setPlaybackProgress: function(p){
        ac_setPlaybackProgress(p);
    }
}