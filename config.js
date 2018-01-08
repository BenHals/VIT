const config = {
    numericalStatistics: ['Mean', 'Median'],
    categoricalStatistics: ['Proportion'],
    sampleSizeOptions: {"fullRange":0, "popSize":1},
    randVarGroups: ["A", "B", "C", "D", "E"],
    server: "https://www.stat.auckland.ac.nz/~wild/VITonline/",
    NA: ["NA", "na", "N/A", "n/a", ""],
    groupColorsList: [ "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"],
    proportionColorsList: ["#3366cc", "#dc3912",'#1b9e77','#d95f02','#7570b3'],
    initStatistics: function(dimensions){
        if(dimensions[0].type == 'numeric'){
            if(dimensions.length < 2 || (dimensions[1].type == 'categoric' && dimensions[1].factors.length < 3)){
                return ["Mean", "Median"];
            }else if(dimensions[1].type == 'numeric'){
                return ["Slope"];
            }else{
                return ["Average Deviation", "F Stat"];
            }
        }else{
            if(dimensions.length < 2 || dimensions[1].factors.length < 3){
                return ["proportion"];
            }else{
                return ["Average Deviation", "F Stat"];
            }
            
        }
    },

}

config.modules =  {
    "Home": {
        name: "Home",
        baseHTML: generateHomeHTML,
        baseControls: null,
        generateSample:function(population, sampleSize){
            return null;
        }
    },
    "Sampling Variation": {
        name: "Sampling Variation",
        baseHTML: generateModuleHTML,
        baseControls: generateFileControls,
        allowedVariables:[['n', null], ['c', null], ['n', 'c'], ['c','c'], ['n', 'n']],
        options: [{name: 'Statistic', type: 'category', values: ["Mean", "Median"], default: "Mean", validate: (v, o)=> o.values.includes(v)}, 
                {name: 'Sample Size', type: "number", range: [0, 'max'], default: 10, validate: (v, o)=> (v > o.range[0] && v < o.range[1])}],
        generateSample:function(population_rows, sampleSize,){
            // Each sample should be sampleSize elements taken from the pop
            // without replacement (can't take the same element twice).
            var sample = population_rows.slice(0, population_rows.length);
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
        baseControls: generateFileControls,
        allowedVariables:[['n', null], ['c', null], ['n', 'c'], ['c','c']],
        sampleSize:config.sampleSizeOptions['fullRange'],
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
        baseControls: generateFileControls,
        allowedVariables:[['n', null]],
        sampleSize:config.sampleSizeOptions['popSize'],
        sampleGroups:config.randVarGroups.slice(0, 2),
        generateSample:function(data, sampleSize, pop){
            // Sample Elements are the same as the population elements,
            // but with either A or B set as the group.
            var population = pop ? pop : data.allDataPoints;
            var sample = [];
            for(var i = 0; i < sampleSize; i++){
                // Pick a random element and copy it.
                var popItem = $.extend(true, {}, population.slice(i,i+1)[0]);
                var group = Math.random();
                var group_index = Math.floor(group/(1/this.sampleGroups.length));
                popItem.dimensionValues.push(this.sampleGroups[group_index]);
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
        baseControls: generateFileControls,
        allowedVariables:[['n', 'c'], ['c','c']],
        sampleSize:config.sampleSizeOptions['popSize'],
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
        playSectionLabels:["Sampling","Sampling Distribution", "Statistics"],

    }
}