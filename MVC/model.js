/*jshint esversion: 6 */
class modelClass {
    constructor(){
        state.parsedData = {};
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
        };
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
        var columns = state.parsedData.columns;

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
        for(var c in columns){
            var colVariable = columns[c];
            variableList.push([colVariable, state.variableType[colVariable]]);
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

        var columns = state.parsedData.columns;
        var numRows = state.parsedData.length;
        var rejected = 0;
        for(var i = 0; i < numRows; i++){
            var row = state.parsedData[i];
            var prunedDimensionValues = [];
            var categoryOk = true;
            for(var d in state.dimensions){
                var dimension = state.dimensions[d];
                var dimensionValue;
                if(dimension.type == 0){
                    dimensionValue = +row[dimension.name];
                }else{
                    dimensionValue = row[dimension.name];

                    if($.inArray(dimensionValue, dimension.categories) == -1) {
                        categoryOk = false;
                        rejected++;
                    }
                }
                prunedDimensionValues.push(dimensionValue);
            }
            if(categoryOk) allDataPoints.push({id:i-rejected, dimensionValues:prunedDimensionValues});
        }
        state.prunedData.allDataPoints = allDataPoints;
        state.prunedData.statistics = calculateDataSetStatistics(allDataPoints, state.dimensions, state.focus);
        state.prunedData.focus = state.focus;

        var focus = state.focus;
        var self = this;
        for(var dim in state.dimensions){
            if(state.dimensions[dim].type == 1){
                state.dimensions[dim].categories.sort(function(a,b){
                    if(focus){
                        if(a == focus) return -1;
                        if(b == focus) return 1;
                    }
                    if(dim == 1){
                        var aStat = state.dimensions[0].type == 0 ? state.prunedData.statistics.grouped[a].Mean : state.prunedData.statistics.grouped[a].focusProportion;
                        var bStat = state.dimensions[0].type == 0 ? state.prunedData.statistics.grouped[b].Mean : state.prunedData.statistics.grouped[b].focusProportion;
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
        state.sampleData = {};
        state.sampleData.dimensions = state.dimensions;

        // If we are in the randomisation variation module, samples actually have 
        // an extra dimension, as they are grouped as either A or B.
        if(state.selectedModule.name == "Randomisation Variation"){
            state.sampleData.dimensions.push({name:"RandVariation", type:1, categories:["A", "B"]});
        }

        var samples = [];
        this.takeSamplesSplit(0, samples, []);
        

    }
    takeSamplesSplit(upto, samples, distributionStatistics){
        var self = this;
        var newSamples = [];
        var s = upto;
        for(; s < upto+100 && s < state.numSamples; s++){
            var sample = state.selectedModule.generateSample(state.prunedData, state.sampleSize);
            var sampleStatistics = calculateDataSetStatistics(sample, state.sampleData.dimensions, state.focus);
            distributionStatistics.push(sampleStatistics.overall[state.statistic]);
            newSamples.push({allDataPoints:sample, id:s, statistics:sampleStatistics, dimensions:state.sampleData.dimensions});
      
        }
        samples = samples.concat(newSamples);
        takeSamplesProgressUpdate(s/(state.numSamples-1) * 100);
        if(s >= state.numSamples){
            state.sampleData.samples = samples;
            state.sampleData.distribution = distributionStatistics;
            takeSamplesFin();  
        }else{
            setTimeout(function(){self.takeSamplesSplit(s, samples, distributionStatistics);}, 1);
        }
    }

    getDistributionScale(){
        // If we are just doing a single group, I.E no second dimension,
        // the distribution scale is the same as the population scale.
        // If we have two groups, the distribution is the difference, and is the same
        // width but 0 is in the center.
        // If we have multiple groups, the average deviation has the same scale but 0 is at the start.
        var distScale;
        var domain;
        if(state.sampleData.dimensions.length == 1){
            return vis.popScale.copy();
        }else if(state.sampleData.dimensions[1].categories.length == 2){
            distScale = vis.popScale.copy();
            domain = distScale.domain();
            var mid = (domain[1] - domain[0])/2 + domain[0];
            var midDistanceToZero = 0 - mid;
            distScale.domain([domain[0] + midDistanceToZero, domain[1] + midDistanceToZero]);
            return distScale;
        }else{
            distScale = vis.popScale.copy();
            domain = distScale.domain();
            var startDistanceToZero = 0 - domain[0];
            distScale.domain([domain[0] + startDistanceToZero, domain[1] + startDistanceToZero]);
            return distScale;
        }


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
    statisticObject.Mean = d3.mean(dataSet, o=>accessDimension(o,dim));
    statisticObject.lQuartile = d3.quantile(dataSet, 0.25, o=>accessDimension(o,dim));
    statisticObject.Median = d3.median(dataSet, o=>accessDimension(o,0));
    statisticObject.uQuartile = d3.quantile(dataSet, 0.75, o=>accessDimension(o,dim));
}

function categoricalStats(statisticObject, dataSet, dim, focus){
    // Find the number of elements where the first dimension category is the focus
    var focusTotal = dataSet.reduce(function(sum, value){return accessDimension(value,dim) == focus ? sum+1 : sum;}, 0);
    statisticObject.focusProportion = dataSet.length != 0 ? focusTotal/dataSet.length : 0;
    statisticObject.Proportion = dataSet.length != 0 ? focusTotal/dataSet.length : 0;
}
function categoryDiffs(statisticObject, dataSet, dimensions, categories){
    // TODO: make this a setting. Change in drawing as well.
    var statisticForDiff = dimensions[0].type == 0 ? "Mean" : "Proportion";
    statisticObject.overall.Diff = (statisticObject.grouped[categories[1]][statisticForDiff] - statisticObject.grouped[categories[0]][statisticForDiff]);
}
function categoryVariation(statisticObject, dataSet, dimensions, categories){
    // TODO: make this a setting. Change in drawing as well.
    var statisticForDiff = dimensions[0].type == 0 ? "Mean" : "Proportion";
    var overallStat = statisticObject.overall[statisticForDiff];
    var sum = 0;
    for(var c in categories){
        var category = categories[c];
        var catStat = statisticObject.grouped[category][statisticForDiff];
        if(catStat == undefined) continue;
        var deviation = catStat - overallStat;
        sum += Math.abs(deviation);
    }
    statisticObject.overall.AvgDeviation = sum/categories.length;
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
            var data = dataSet.filter(function(d){return d.dimensionValues[1] == categoryName;});
            if(dimensions[0].type == 0){
                numericalStats(statistics.grouped[categoryName], data, 0);
            }else{
                categoricalStats(statistics.grouped[categoryName], data, 0, focus);
            }
        }
        // Set Difference or average variation depending on 2 or multi categories.
        if(dimensions[1].categories.length == 2){
            categoryDiffs(statistics, dataSet, dimensions, dimensions[1].categories);
        }
        categoryVariation(statistics, dataSet, dimensions, dimensions[1].categories);
    }

    return statistics;
}
