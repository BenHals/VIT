var state = {variables_selected: new Set(), dimensions: [], numSamples:1000};

var numericalStatistics = ['Mean', 'Median'];
var categoricalStatistics = ['Proportion'];
// Options for modules.
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
        generateSample:function(data, sampleSize, pop){
            // Each sample should be sampleSize elements taken from the pop
            // without replacement (can't take the same element twice).
            var population = pop ? pop : data.allDataPoints;
            var sample = population.slice();
            d3.shuffle(sample);
            sample = sample.slice(0, sampleSize);
            return sample;
        }
    },
    "Bootstrapping": {
        name: "Bootstrapping",
        baseHTML: generateModuleHTML,
        generateSample:function(data, sampleSize, pop){
            var population = pop ? pop : data.allDataPoints;
            return population.slice(0, sampleSize);
        }
    },
    "Randomisation Variation": {
        name: "Randomisation Variation",
        baseHTML: generateModuleHTML,
        generateSample:function(data, sampleSize, pop){
            var population = pop ? pop : data.allDataPoints;
            return population.slice(0, sampleSize);
        }
    },
    "Randomisation Test": {
        name: "Randomisation Test",
        baseHTML: generateModuleHTML,
        generateSample:function(data, sampleSize, pop){
            var population = pop ? pop : data.allDataPoints;
            return population.slice(0, sampleSize);
        }
    },
};

var view = new viewClass();
var model = new modelClass();
var vis = new visualisation();

window.onload = function(){

    state.loadingFromURL = true;
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
    }


};

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

function localFile(){
    var file = $('#localFile')[0].files[0];
    if(file){
        var newURL = deleteURLParameter(window.location.href, ['file','d0','d1','focus', 'statistic', 'ss']);
        window.history.pushState({path:newURL},'', newURL)
        state.filename = file.name;
        model.getLocalFile(file);
    }
}

function parsedCSV(){
    $('#selectedFile').text(state.filename);
    $('#fileSelectDone').removeAttr('disabled');
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
    var selectedLabels = fromButton ? [...e.target.selectedOptions].map(function(option){return option.innerText}) : e;
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

    // Get the names any types
    for(var i in variableArray){
        var variableWhole = variableArray[i];
        var variableName = variableWhole.substring(0, variableWhole.length-4);
        var variableType = variableWhole.substring(variableWhole.length-2, variableWhole.length-1) == 'n' ? 0 : 1;
        state.dimensions.push({name:variableName, type:variableType});

        // Set our url parameter to reload here.
        var vLetter = variableType == 0 ? 'n' : 'c';
        var newURL = updateURLParameter(window.location.href, 'd'+i, variableName +" (" + vLetter +')');
        window.history.pushState({path:newURL},'', newURL)

    }

    // We cannot handle numerical data on the second dimension.
    if(state.dimensions.length > 1 && state.dimensions[1].type == 0){
        view.numericalSecondDim();
        return;
    }
    model.setDimensions(state.dimensions);

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
    vis.draw();

}

function toggleDataDisplay(){
    view.toggleDataDisplay();
}

function canvasRedraw(scaleX){
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
    if(ssInt < 1 || ssInt > ssMax){
        view.sampleSizeAlert("Sample size must be between 0 and the size of the population (" + ssMax +")");
        state.sampleSize = null;
        return
    }
    state.sampleSize = ssInt;
    view.sampleSizeValid();

    // Set our url parameter to reload here.
    var newURL = updateURLParameter(window.location.href, 'ss', state.sampleSize);
    window.history.pushState({path:newURL},'', newURL);
    
}

function getStatisticsOptions(){
    var statisticsOptions = vis.getStatisticsOptions();
    setStatistic(state.statistic ? state.statistic : statisticsOptions[0]);
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
    model.takeSamples();
}

function takeSamplesProgressUpdate(progress){
    if(progress < 100){
        view.takeSamplesProgressUpdate(progress);
    }else{
        takeSamplesFin();
    }
}

function takeSamplesFin(){
    state.selectedSample = 0;
    // Give some delay to see loading bar :)
    setTimeout(function(){view.takeSamplesFin()}, 500);
}

function selectedSampleChange(change){
    if(state.selectedSample != undefined){
        state.selectedSample += change;

        // Handle modulus with negative numbers
        state.selectedSample = ((state.selectedSample%state.numSamples)+state.numSamples)%state.numSamples;

        // Refresh table values
        view.setupSampleTableValues();
    }
}
function startVisButtonClicked(){
    return;
}

function sampleOptionsSwitch(){
    view.sampleOptionsSwitch();
}
