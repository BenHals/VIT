var state = {variables_selected: new Set(), dimensions: [], numSamples:1000, paused:false};

var numericalStatistics = ['Mean', 'Median'];
var categoricalStatistics = ['Proportion'];
var sampleSizeOptions = {"fullRange":0, "popSize":1};
// Options for modules.
// allowed variables should be a list of variable types acceptable, [0, 1] means
// dimension 1 is numeretical and dimension 2 is categorical.
// generateSample should return a function to generate 1 sample from the population.
var modules = {
    "Home": {
        name: "Home",
        baseHTML: generateHomeHTML,
        generateSample:function(population, sampleSize){
            return null;
        }
    },
    "Sampling Variation": {
        name: "Sampling Variation",
        baseHTML: generateModuleHTML,
        allowedVariables:[[0, null], [1, null], [0, 1], [1,1]],
        sampleSize:sampleSizeOptions['fullRange'],
        generateSample:function(data, sampleSize, pop){
            // Each sample should be sampleSize elements taken from the pop
            // without replacement (can't take the same element twice).
            var population = pop ? pop : data.allDataPoints;
            var sample = population.slice();
            d3.shuffle(sample);
            sample = sample.slice(0, sampleSize);
            return sample;
        },
        labels:["Population", "Sample", "Sample Distribution"],
        playSectionLabels:["Sampling","Sampling Distribution", "Statistics"]
    },
    "Bootstrapping": {
        name: "Bootstrapping",
        baseHTML: generateModuleHTML,
        allowedVariables:[[0, null], [1, null], [0, 1], [1,1]],
        sampleSize:sampleSizeOptions['fullRange'],
        generateSample:function(data, sampleSize, pop){
            // Each sample should be sampleSize elements taken from the pop
            // with replacement (CAN take the same element twice).
            var population = pop ? pop : data.allDataPoints;
            var sample = [];
            for(var i = 0; i < sampleSize; i++){
                // Pick a random element
                var popIndex = Math.floor(d3.randomUniform(population.length)());
                sample = sample.concat(population.slice(popIndex,popIndex+1));

            }
            return sample;
        },
        labels:['Data','Re-Sample','Bootstrap Distribution'],
        playSectionLabels:["Sampling","Sampling Distribution", "Statistics"]
    },
    "Randomisation Variation": {
        name: "Randomisation Variation",
        baseHTML: generateModuleHTML,
        allowedVariables:[[0, null]],
        sampleSize:sampleSizeOptions['popSize'],
        generateSample:function(data, sampleSize, pop){
            // Sample Elements are the same as the population elements,
            // but with either A or B set as the group.
            var population = pop ? pop : data.allDataPoints;
            var sample = [];
            for(var i = 0; i < sampleSize; i++){
                // Pick a random element and copy it.
                var popItem = $.extend(true, {}, population.slice(i,i+1)[0]);
                var group = Math.random();
                popItem.dimensionValues.push(group < 0.5 ? "A" : "B");
                sample.push(popItem);

            }
            return sample;
        },
        labels:['Data','Random Variation','Randomisation Distribution'],
        playSectionLabels:["Sampling","Sampling Distribution", "Statistics"]
    },
    "Randomisation Test": {
        name: "Randomisation Test",
        baseHTML: generateModuleHTML,
        allowedVariables:[[0, 1], [1,1]],
        sampleSize:sampleSizeOptions['popSize'],
        generateSample:function(data, sampleSize, pop){
            // Sample Elements are the same as the population elements,
            // but with the second dimension randomised, keeping the number of elements in 
            // each the same.
            var population = pop ? pop : data.allDataPoints;
            var sample = [];
            var categories = state.prunedData.dimensions[1].categories;
            // Get the number of elements in each category
            var newCategories = [];
            for(var c in categories){
                var category = categories[c];
                var numInCategory = population.filter(function(element){return element.dimensionValues[1] == category}).length;
                newCategories = newCategories.concat(Array(numInCategory).fill(c));
            }
            d3.shuffle(newCategories);
            for(var i = 0; i < sampleSize; i++){
                // Pick a random element and copy it.
                var popItem = $.extend(true, {}, population.slice(i,i+1)[0]);
                
                var group = newCategories[i];
                popItem.dimensionValues[1] = categories[group];
                sample.push(popItem);

            }
            return sample;
        },
        labels:['Data','Re-Randomised Data','Re-Randomisation Distribution'],
        playSectionLabels:["Sampling","Sampling Distribution", "Statistics"]
    }
};

var view = new viewClass();
var model = new modelClass();
var vis = new visualisation();

window.onload = function(){
    window.state = {variables_selected: new Set(), dimensions: [], numSamples:1000, paused:false};
    state.loadingFromURL = true;
    state.urlModule = getURLParameter(window.location.href, 'module');
    state.urlFile = getURLParameter(window.location.href, 'file');
    state.urlD0 = getURLParameter(window.location.href, 'd0');
    state.urlD1 = getURLParameter(window.location.href, 'd1');
    state.urlFocus = getURLParameter(window.location.href, 'focus');
    state.urlSampleSize = getURLParameter(window.location.href, 'ss');
    state.urlStatistic = getURLParameter(window.location.href, 'statistic');
    state.menuDesign = getURLParameter(window.location.href, 'design');
    state.design = state.menuDesign == "new" ? new_design : old_design;
    // Check for a selected module in the url.
    var urlModule = getURLParameter(window.location.href, 'module');
    urlModule = urlModule != null ? urlModule : "Home";
    loadModule(urlModule);

    // Check for selected file in the url
    var urlFile = getURLParameter(window.location.href, 'file');
    if(urlFile == null) {
        state.loadingFromURL = false;
        return;
    }
    var urlFileName = urlFile.split(':');
    if(urlFileName[0] == 'preset'){
        loadFromPreset(urlFileName[1]);
    }else if(urlFileName[0] == 'url'){
        var baseURL = "";
        for(var i = 1; i < urlFileName.length; i++){
            baseURL += urlFileName[i];
            if(i < urlFileName.length - 1) baseURL+=":";
        }
        reconstructURL(baseURL);
    }


};

function reconstructURL(baseURL){
    console.log(baseURL);
    var parameters = getURLParameter(window.location.href, 'urlParams').split('-');
    console.log(parameters);
    var url = baseURL;
    if(parameters.length > 1){
        url += "?";
        for(var p = 0; p < parameters.length - 1; p++){
            var keyValue = parameters[p].split(':');
            url += keyValue[0] + "=" + keyValue[1];
            if( p != parameters.length-2) url += "&";
        }
    }
    loadFromURL(url);

}
function loadModule(moduleName){

    // Set the current selected module.
    state.selectedModule = modules[moduleName];

    // Get the view to switch to the new module.
    view.switchModule(state.selectedModule.baseHTML(state.selectedModule.name));

    // Set our url parameter to reload here.
    var newURL = updateURLParameter(window.location.href, 'module', moduleName);
    window.history.pushState({path:newURL},'', newURL)
}

function selectedFileClicked(vars){
    newFileReset();
    view.selectedFileDone(state.filename);

    view.setupVariableDisplay(model.getVariables(), vars);

}
function newFileReset(){
    state.sampleSize = null;
    state.statistic = null;
}



function parsedCSV(){
    $('#selectedFile').text(state.filename);
    $('#fileSelectDone').removeAttr('disabled');
    // The new design has a modal with a done button, otherwise confirm immediatly.
    if(state.menuDesign != "new"){
        selectedFileClicked();
    }
    if(state.loadingFromURL){

        // Check for variables in URL
        var urlD0 = getURLParameter(window.location.href, 'd0');
        if(urlD0 != null){
            var urlD1 = getURLParameter(window.location.href, 'd1');
            if(urlD1 != null){
                selectedFileClicked([urlD0, urlD1]);
                varSelected([urlD0, urlD1], false);
            }else{
                selectedFileClicked([urlD0]);
                varSelected([urlD0], false);
            }
        }else{
            state.loadingFromURL = false;
            selectedFileClicked();

        }
    }
}

function getPresets(callback){
    model.getPresets(callback);
}

function localFile(){
    var file = $('#localFile')[0].files[0];
    if(file){
        var newURL = deleteURLParameter(window.location.href, ['file','d0','d1','focus', 'statistic', 'ss']);
        window.history.pushState({path:newURL},'', newURL)
        state.filename = file.name;
        model.getLocalFile(file);
    }
}

function loadFromPreset(filename){
    model.loadFromPreset(filename);
    state.filename = filename;

    // Set our url parameter to reload here.
    var newURL = updateURLParameter(window.location.href, 'file', "preset:"+filename);
    window.history.pushState({path:newURL},'', newURL);
    if(!state.loadingFromURL){
        newURL = deleteURLParameter(window.location.href, ['d0','d1','focus']);
        window.history.pushState({path:newURL},'', newURL)
    }
}

function loadFromURL(u){
    var url = u ? u : $("#urlInputField").val();
    model.loadFromURL(url);
    state.filename = url;
    var parameters = {};
    var parameterSplit = url.split("?");
    parameterSplit = parameterSplit.length > 1 ? parameterSplit[1] : [];
    if(parameterSplit.length > 0){
        parameterSplit = parameterSplit.split('&');
        for(var pIndex = 0; pIndex < parameterSplit.length; pIndex++){
            var keyValue = parameterSplit[pIndex].split('=');
            parameters[keyValue[0]] = keyValue[1];
        }
    }
    console.log(parameters);

    // Set our url parameter to reload here.
    var paramString = "";
    for(var param in parameters){
        paramString += param+":"+parameters[param]+"-";
    }
    var newURL = updateURLParameter(window.location.href, 'file', "url:"+url);
    window.history.pushState({path:newURL},'', newURL);
    newURL = updateURLParameter(window.location.href, "urlParams", paramString);
    window.history.pushState({path:newURL},'', newURL);
    if(!state.loadingFromURL){
        newURL = deleteURLParameter(window.location.href, ['d0','d1','focus']);
        window.history.pushState({path:newURL},'', newURL)
    }
}
function newVarReset(){
    // Reset Focus
    state.focus = undefined;
    model.setFocus(state.focus);

    // Reset dimensions
    state.dimensions = [];

    // Reset URL
    var newURL = deleteURLParameter(window.location.href, ['d0', 'd1']);
    window.history.pushState({path:newURL},'', newURL);

    // reset statistic
    state.statistic = null;
    $('#statisticSelect').html("");
}
function varSelected(e, fromButton){
    newVarReset();


    // Select inputs dont have ordering, so we must keep track ourselves
    var selectedLabels = fromButton ? [...Array.prototype.slice.call(e.target.selectedOptions)].map(function(option){return option.innerText}) : e;
    var selOptions = new Set(selectedLabels);
    for (var index = 0; index < selectedLabels.length; index++){
        state.variables_selected.add(selectedLabels[index])
    }
    var set_items = [...state.variables_selected];
    for (var index = 0; index < set_items.length; index++){
        if(!selOptions.has(set_items[index])){
            state.variables_selected.delete(set_items[index]);
        }
    }

    var variableArray = [...state.variables_selected];

    // Can only handle 2 dimentional data right now.
    if(variableArray.length > 2){
        view.tooManyVariables();
        return;
    }

    var tempDimensions = [];
    // Get the names any types
    for(var i in variableArray){
        var variableWhole = variableArray[i];
        var variableName = variableWhole.substring(0, variableWhole.length-4);
        var variableType = variableWhole.substring(variableWhole.length-2, variableWhole.length-1) == 'n' ? 0 : 1;
        tempDimensions.push({name:variableName, type:variableType});

        // Set our url parameter to reload here.
        var vLetter = variableType == 0 ? 'n' : 'c';
        var newURL = updateURLParameter(window.location.href, 'd'+i, variableName +" (" + vLetter +')');
        window.history.pushState({path:newURL},'', newURL)

    }

    // We cannot handle numerical data on the second dimension.
    if(tempDimensions.length > 1 && tempDimensions[1].type == 0){
        view.numericalSecondDim();
        return;
    }

    // Check if the selected variables are allowed for the selected module (randomisation variation 
    // cant take a second dimension for example).
    var selectedTypes = [tempDimensions[0].type, tempDimensions[1] ? tempDimensions[1].type : null];
    if(!state.selectedModule.allowedVariables.some(function(element){return element[0] == selectedTypes[0] && element[1] == selectedTypes[1]})){
        view.wrongModule();
        return;
    }
    model.setDimensions(tempDimensions);

    // If the first dimension is categorical, create the focus selector
    if(state.dimensions[0].type == 1){
        var categories = model.getCategories(state.dimensions[0].name);
        var urlFocus = getURLParameter(window.location.href, 'focus');

        state.focus = urlFocus != null && $.inArray(urlFocus, categories) != -1 ? urlFocus : categories[0];
        var newURL = updateURLParameter(window.location.href, 'focus', state.focus);
        window.history.pushState({path:newURL},'', newURL)
        view.setupFocus(categories, state.focus);
        model.setFocus(state.focus);
        state.loadingFromURL = false;
    }

    checkSampleURLParameters();
    // Set up the population view
    setupPopulation();
}

function checkSampleURLParameters(){
    var ssURL = getURLParameter(window.location.href, 'ss');
    var statURL = getURLParameter(window.location.href, 'statistic');
    if(ssURL) state.sampleSize = ssURL;
    if(statURL) state.statistic = statURL;
}

function focusSelected(e){
    var selectedOptions = [...e.target.selectedOptions].map(function(option){return option.innerText});
    state.focus = selectedOptions[0];
    model.setFocus(state.focus);
    // Set our url parameter to reload here.
    var newURL = updateURLParameter(window.location.href, 'focus', state.focus);
    window.history.pushState({path:newURL},'', newURL)

    setupPopulation();
}

function setupPopulation(){
    model.pruneData();
    view.setupPopulation(state.prunedData);
    vis.setup(state.prunedData, state.selectedModule);
    vis.setupPopulationElements();
    vis.drawPop();

}

function toggleDataDisplay(){
    view.toggleDataDisplay();
}

function canvasRedraw(scaleX){
    state.scaleX = scaleX;
    vis.scale(scaleX);
    vis.draw();
}

function sampleButtonClicked(){
    view.sampleOptionsSwitch();
}
function fileOptionsSwitch(){
    view.fileOptionsSwitch();
}

function getSampleSizeMax(){
    return vis.sampleSizeMax();
}
function getSampleSizeMin(){
    return vis.sampleSizeMin();
}
function getSampleSizeDefault(){
    return state.sampleSize != null ? state.sampleSize : vis.sampleSizeDefault();
}

function validateSampleSize(){

    // Remove old alerts
    $('#sampleSizeAlert').remove();

    var sampleSizeValue = $('#sampleSizeInput').val();
    var ssInt = parseInt(sampleSizeValue);
    if(isNaN(ssInt)){
        view.sampleSizeAlert("Sample Size must be an integer value");
        state.sampleSize = null;
        return;
    }

    var ssMax = getSampleSizeMax();
    var ssMin = getSampleSizeMin();
    if(ssInt < ssMin || ssInt > ssMax){
        var alertText = ssMax != ssMin ? "Sample size must be between "+ssMin+" and the size of the population (" + ssMax +")" :
                                        "This module only allows the sample size to be the same as the population (" + ssMax +")";
        view.sampleSizeAlert(alertText);
        state.sampleSize = null;
        return;
    }
    state.sampleSize = ssInt;
    view.sampleSizeValid();

    // Set our url parameter to reload here.
    var newURL = updateURLParameter(window.location.href, 'ss', state.sampleSize);
    window.history.pushState({path:newURL},'', newURL);
    
}

function getStatisticsOptions(){
    var statisticsOptions = vis.getStatisticsOptions();
    setStatistic(state.statistic && $.inArray(state.statistic, statisticsOptions) != -1 ? state.statistic : statisticsOptions[0]);
    return statisticsOptions;
}
function setStatistic(stat){
    state.statistic = stat;
    model.setStatistic(state.statistic);
    // Set our url parameter to reload here.
    var newURL = updateURLParameter(window.location.href, 'statistic', state.statistic);
    window.history.pushState({path:newURL},'', newURL);
}

function statisticSelected(e){
    var selectedOptions = [...e.target.selectedOptions].map(function(option){return option.innerText});
    setStatistic(selectedOptions[0]);

    setupPopulation();
}

function takeSamplesButtonClicked(){
    view.visualisationViewSwitch();
    model.setState(state);
    setTimeout(function(){model.takeSamples()}, 500);
    
}

function takeSamplesProgressUpdate(progress){
    view.takeSamplesProgressUpdate(progress);
        
}

function takeSamplesFin(){
    state.selectedSample = 0;
    // Give some delay to see loading bar :)
    setTimeout(function(){
        view.takeSamplesFin();    
        vis.setupSampleElements();
        vis.initVisualisation();
        //vis.setupSample(state.selectedSample);
        //vis.beginAnimationSequence(5, getAnimation(state.selectedModule, state.prunedData.dimensions, state.sampleData.dimensions, 5, false, 0.5));
    }, 500);

}

function selectedSampleChange(change){
    if(state.selectedSample != undefined){
        state.selectedSample += change;

        // Handle modulus with negative numbers
        state.selectedSample = ((state.selectedSample%state.numSamples)+state.numSamples)%state.numSamples;

        // Refresh table values
        view.setupSampleTableValues();

        // Refresh vis
        vis.nextSample(state.selectedSample);
    }
}
function visSampleChange(change){
    if(state.selectedSample != undefined){

        // Refresh table values
        view.setupSampleTableValues();

    }
}

function readDistSequence(radioName){
    var radioGroup = $("input:radio[name='"+radioName+"']:checked");
    var num = radioGroup.val();

    // Second parameter should be true if the distribution animation is playing.
    distSequence(num, radioName=="distOptions");
}

function distSequence(num, d, s){
    unpause();
    var speed = s ? s : 1/num;
    var dist = d ? d : false;
    if(num > 100){
        vis.beginAnimationSequence(1, getDistAnimation(state.selectedModule, state.prunedData.dimensions, state.sampleData.dimensions, 1));
        state.resetDist = true;
    }else{
        vis.beginAnimationSequence(num, getAnimation(state.selectedModule, state.prunedData.dimensions, state.sampleData.dimensions, num, dist, speed));
    }

}
function showCI(){
    unpause();
    vis.beginAnimationSequence(1, getCIAnimation(state.selectedModule, state.prunedData.dimensions, state.sampleData.dimensions, 1));
    state.resetDist = true;
}
function startVisButtonClicked(){
    return;
}

function sampleOptionsSwitch(){
    view.sampleOptionsSwitch();
}

function getDistributionScale(){
    return model.getDistributionScale();
}

function pause(){
    state.paused = true;
    vis.pause();
    view.toUnPause();
}
function unpause(){
    state.paused = false;
    vis.unpause();
    view.toPause();
}
function pauseToggle(){
    if(state.paused){
        unpause();
    }else{
        pause();
    }
    //state.paused = !state.paused;
}

function visAnimDraggableInit(animation){
    view.visAnimDraggableInit(animation);
}
function visAnimDraggableProgress(animation, stageProgress){
    view.visAnimDraggableProgress(animation, stageProgress);
}
function visAnimUserInput(e){
    this.pause();
    var animProgress = $('#visAnimProgress').val();
    for(var stage in state.animDraggableMap){
        if(animProgress < state.animDraggableMap[stage].range[1] && animProgress >= state.animDraggableMap[stage].range[0]){
            var syntheticStartTimeDiff = (animProgress - state.animDraggableMap[stage].range[0]);
            var stageProgress = syntheticStartTimeDiff/state.animDraggableMap[stage].width;
            console.log(stage + " : " + stageProgress + " : " + syntheticStartTimeDiff);
            vis.setAnimProgress(stage, stageProgress, syntheticStartTimeDiff);
        }
    }
}
function visAnimUserRelease(e){
    return;
}
