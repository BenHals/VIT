const config = {
    numericalStatistics: ['Mean', 'Median'],
    categoricalStatistics: ['Proportion'],
    sampleSizeOptions: {"fullRange":0, "popSize":1},
    randVarGroups: ["A", "B", "C", "D", "E"],
    server: "https://www.stat.auckland.ac.nz/~wild/VITonline/",
    NA: ["NA", "na", "N/A", "n/a", ""],

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
        allowedVariables:[['n', null], ['c', null], ['n', 'c'], ['c','c']],
        sampleSize:config.sampleSizeOptions['fullRange'],
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
        playSectionLabels:["Sampling","Sampling Distribution", "Statistics"]
    }
}