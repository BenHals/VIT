class modelClass {
    constructor(){
        state.parsedData;
        state.variableType = {};
        state.categories = {};
    }

    getLocalFile(file){
        var self = this;
        var reader = new FileReader();
        reader.readAsText(file);
        this.dataSplit = {};
        reader.onload = function(e){
            var csv = e.target.result;
            self.parseCSV(csv);
        }
    }

    parseCSV(csv){
        state.parsedData = d3.csvParse(csv);
        console.log(state.parsedData);
        parsedCSV();
    }

    getPresets(callback){
        var xhr = createCORSRequest('GET', "https://www.stat.auckland.ac.nz/~wild/VITonline/filegetTest.php");
        //var xhr = createCORSRequest('GET', "http://localhost:8080/filegetTest.php");
        if (!xhr) {
            throw new Error('CORS not supported');
        }
          // Response handlers.
        xhr.onload = function() {
            var text = xhr.responseText;
            callback(JSON.parse(text));
        };

        xhr.onerror = function() {
            callback("error");
        };

        xhr.send();
    }

    loadFromPreset(filename){
        var self = this;
        //this.controller.setUpDataVeiw(this.storedData[filename]);
        var xhr = createCORSRequest('GET', "https://www.stat.auckland.ac.nz/~wild/VITonline/getFileTest.php"+"?fn=" +filename);
        //var xhr = createCORSRequest('GET', "http://localhost:8080/getFileTest.php"+"?fn=" +filename); 
        if (!xhr) {
            throw new Error('CORS not supported');
        }
              // Response handlers.
          xhr.onload = function() {
            var text = xhr.responseText;
            self.parseCSV(text);
          };

          xhr.onerror = function() {
            alert('Woops, there was an error making the request.');
          };

          xhr.send();
    }

    getVariables(){
        var columns = state.parsedData['columns'];

        var numRows = state.parsedData.length;

        for(var i = 0; i < numRows; i++){
            var row = state.parsedData[i];
            for(var v in columns){
                var variable = columns[v];
                if(!(variable in state.variableType)){

                    // Assume to be numerical at first
                    state.variableType[variable] = 0;
                }
                if(isNaN(+row[variable]) && row[variable] != "" && row[variable] != "NA" && row[variable] != "N/A"){
                    state.variableType[variable] = 1;
                    if(!(variable in state.categories)) state.categories[variable] = new Set();
                    state.categories[variable].add(row[variable]);

                }
            }
        }
        var variableList = [];
        for(var v in columns){
            variable = columns[v];
            variableList.push([variable, state.variableType[variable]]);
        }
        return variableList;
    }

    setDimensions(dimensions){
        state.dimensions = dimensions;
        for(var d in dimensions){
            if(dimensions[d].type == 1){
                state.dimensions[d].categories = this.getCategories(dimensions[d].name);
            }
        }
    }

    getCategories(name){
        var focus = state.focus;
        var categoriesArray = [...state.categories[name]];
        categoriesArray.sort(function(a,b){
            if(focus){
                if(a == focus) return -1;
                if(b == focus) return 1;
            }
        });
        return [...state.categories[name]];
    }

    setFocus(focus){
        state.focus = focus;
        console.log(state.focus);
    }
    setStatistic(statistic){
        state.statistic = statistic;
        console.log(state.statistic);
    }

    pruneData(){
        state.prunedData = {dimensions:state.dimensions};
        var allDataPoints = [];

        var columns = state.parsedData['columns'];
        var numRows = state.parsedData.length;

        for(var i = 0; i < numRows; i++){
            var row = state.parsedData[i];
            var prunedDimensionValues = [];
            for(var d in state.dimensions){
                var dimension = state.dimensions[d];
                var dimensionValue;
                if(dimension.type == 0){
                    dimensionValue = +row[dimension.name];
                }else{
                    dimensionValue = row[dimension.name];
                }
                prunedDimensionValues.push(dimensionValue);
            }
            allDataPoints.push({id:i, dimensionValues:prunedDimensionValues});
        }
        state.prunedData.allDataPoints = allDataPoints;
        state.prunedData.statistics = calculateDataSetStatistics(allDataPoints, state.dimensions, state.focus);
        state.prunedData.focus = state.focus;

        var focus = state.focus;
        var self = this;
        for(var d in state.dimensions){
            if(state.dimensions[d].type == 1){
                state.dimensions[d].categories.sort(function(a,b){
                    if(focus){
                        if(a == focus) return -1;
                        if(b == focus) return 1;
                    }
                    if(d == 1){
                        var aStat = state.dimensions[d].type == 0 ? state.prunedData.statistics.grouped[a].mean : state.prunedData.statistics.grouped[a].focusProportion;
                        var bStat = state.dimensions[d].type == 0 ? state.prunedData.statistics.grouped[b].mean : state.prunedData.statistics.grouped[b].focusProportion;
                        return (aStat - bStat);
                    }
                });
            }
        }
        console.log(state.prunedData);
    }
    setState(state){
        state.state = state;
    }
    takeSamples(){
        var samples = [];
        for(var s = 0; s < state.numSamples; s++){
            var sample = state.selectedModule.generateSample(state.prunedData, state.sampleSize);
            var sampleStatistics = calculateDataSetStatistics(sample, state.dimensions, state.focus);
            samples.push({sampleDataPoints:sample, id:s, statistics:sampleStatistics});
            takeSamplesProgressUpdate(s/(state.numSamples-1) * 100);
        }
        state.samples = samples;
    }
}

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

function accessDimension(o, d){
    return o.dimensionValues[d];
}

function numericalStats(statisticObject, dataSet, dim){
    statisticObject.extent = d3.extent(dataSet, o=>accessDimension(o,dim));
    statisticObject.mean = d3.mean(dataSet, o=>accessDimension(o,dim));
    statisticObject.lQuartile = d3.quantile(dataSet, 0.25, o=>accessDimension(o,dim));
    statisticObject.median = d3.median(dataSet, o=>accessDimension(o,0));
    statisticObject.uQuartile = d3.quantile(dataSet, 0.75, o=>accessDimension(o,dim));
}

function categoricalStats(statisticObject, dataSet, dim, focus){
    // Find the number of elements where the first dimension category is the focus
    var focusTotal = dataSet.reduce(function(sum, value){return accessDimension(value,dim) == focus ? sum+1 : sum}, 0);
    statisticObject.focusProportion = focusTotal/dataSet.length;
}
function calculateDataSetStatistics(dataSet, dimensions, focus, extraOverallStatistics = {}, extraGroupStatistics = {}){
    var statistics = {};
    statistics.overall = {};
    // Calculate statistics for numerical first dimensions
    if(dimensions[0].type == 0){
        numericalStats(statistics.overall, dataSet, 0);
    }else{
        categoricalStats(statistics.overall, dataSet, 0, focus);
    }

    // If there is a second dimension, and it is categorical, work out the statistics for each group
    if(dimensions.length > 1 && dimensions[1].type == 1){
        statistics.grouped = {};
        for(var c in dimensions[1].categories){
            var categoryName = dimensions[1].categories[c];
            statistics.grouped[categoryName] = {};
            var data = dataSet.filter(function(d){return d.dimensionValues[1] == categoryName});
            if(dimensions[0].type == 0){
                numericalStats(statistics.grouped[categoryName], data, 0);
            }else{
                categoricalStats(statistics.grouped[categoryName], data, 0, focus);
    }
        }
    }

    return statistics;
}
