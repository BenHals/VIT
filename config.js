const config = {
    numericalStatistics: ['Mean', 'Median'],
    categoricalStatistics: ['Proportion'],
    sampleSizeOptions: {"fullRange":0, "popSize":1},

    // Names for synthetic groups created for randomisation variation.
    randVarGroups: ["A", "B", "C", "D", "E"],

    // Location for server get requests.
    server: "https://www.stat.auckland.ac.nz/~wild/VITonline/",

    // Variation on NA to check for when parsing csv files.
    NA: ["NA", "na", "N/A", "n/a", ""],

    // Colors for factors
    groupColorsList: ["#4A96AD", "#9f1213", "#ff9900", "#109618", "#990099", "#0099c6",
                    "#dd4477", "#66aa00", "#b82e2e", "#316395",
                    "#994499", "#22aa99", "#aaaa11", "#6633cc",
                    "#e67300", "#8b0707", "#651067", "#329262",
                    "#5574a6", "#3b3eac"],
    //dc3912

    // Colors for proportion bars.
    proportionColorsList: ['#4A96AD' , '#9f1213 ', "#3366cc", "#dc3912",'#1b9e77','#d95f02','#7570b3'],
    //#9f1213 
    //#7D1935
    // Function to get statistics options users are able to select.
    initStatistics: function(dimensions){
        if(dimensions[0].type == 'numeric'){
            if( dimensions.length < 2 ||
            (dimensions[1].type == 'categoric' &&
            dimensions[1].factors.length < 3)){
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

    element_draw_type: {
        "datapoint": "canvas",
        "prop": "canvas",
        "prop-text": "canvas",
        "text": "canvas",
        "dist_textbox": "canvas",
        "line": "canvas",
        "down-arrow": "canvas",
        "arrow": "canvas",
        "distribution": "canvas",
        "distribution_range": "canvas",
        "axis": "canvas"    
    }
    // element_draw_type: {
    //     "datapoint": "svg",
    //     "prop": "canvas",
    //     "prop-text": "canvas",
    //     "text": "svg",
    //     "dist_textbox": "svg",
    //     "line": "canvas",
    //     "down-arrow": "canvas",
    //     "arrow": "canvas",
    //     "distribution": "canvas",
    //     "distribution_range": "canvas",
    //     "axis": "svg"    
    // }

}

// Options for modules.
// name: Name of module, used for display and module checks.
// baseHTML: function used to generate module html.
// baseControls: function used to generate the default UI menu.
// allowedVariables: combinations of variable types module supports.
// generateOptions: function which takes in selected dimensions and
//                  sets options for users to fill in.
//                  An options has:
//                  name: name user sees, and code sees.
//                  hide_option: dont let user see this options.
//                  type: number or category
//                  values: if a category, values user can pick.
//                  range: if a number, the valid range.
//                  default: initial value.
//                  validate: function to check if value is valid.
// inCI: function which takes in the distribution sorted by 
//              distance to the population statistic, the current 
//              distribution element and the population statistic
//              and returns if the element is in the confidence
//              interval or not.
// generateInCi: function to create the inCI function depending
//              on dimensions selected.
// generateSamples: function to generate a single sample.
// labels: labels shown for each section.
// playSectionLabels: labels shown on the control menu.
config.modules =  {
    "Home": {
        name: "Home",
        baseHTML: generateHomeHTML,
        baseControls: null,
        generateSample:function(population, sampleSize){
            return null;
        },
        generateOptions: function(){return},
        generateInCi: function(){return},
        generateDistribution: function(){return},
    },
    "Sampling Variation": {
        name: "Sampling Variation",
        baseHTML: generateModuleHTML,
        baseControls: generateFileControls,
        allowedVariables:[['n', null], ['c', null], ['n', 'c'], ['c','c'], ['n', 'n']],
        generateOptions: function(dimensions){
            if(dimensions.length < 1) return;
            this.options = [];
            let statistics = {name: 'Statistic', type: 'category', values: config.initStatistics(dimensions), default: config.initStatistics(dimensions)[0], validate: (v, o)=> o.values.includes(v)};
            this.options.push(statistics);
            let sample_size = {name: 'Sample Size', type: "number", range: [0, 'max'], default: 10, validate: (v, o)=> (v > o.range[0] && v < o.range[1])};
            this.options.push(sample_size);
        },
        inCI: function(distribution_sorted, dist_element, population_statistic){
            let top_index = Math.floor(distribution_sorted.length * 0.95);
            let middle_95 = distribution_sorted.slice(0, top_index);
            return middle_95.includes(dist_element);
        },
        generateInCi: function(dimensions){
            if(dimensions.length < 1) return;
            if(dimensions.length > 1 && dimensions[1].factors.length > 2){
                this.inCI = function(distribution_sorted, dist_element, population_statistic){
                    return dist_element.point_value > population_statistic;
                }
            }else{
                this.inCI = function(distribution_sorted, dist_element, population_statistic){
                    let top_index = Math.floor(distribution_sorted.length * 0.95);
                    let middle_95 = distribution_sorted.slice(0, top_index);
                    return middle_95.includes(dist_element);
                }
            }
            
        },
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
        generateDistribution: function(dataset, stat){
            return {"point_value": dataset.statistics[stat]};
        },
        labels:["Population", "Sample", "Sample Distribution"],
        playSectionLabels:["Sampling","Sampling Distribution", "Statistics"]
    },
    "Confidence Interval": {
        name: "Confidence Interval",
        baseHTML: generateModuleHTML,
        baseControls: generateFileControls,
        allowedVariables:[['n', null], ['c', null]],
        generateOptions: function(dimensions){
            if(dimensions.length < 1) return;
            this.options = [];
            let statistics = {name: 'Statistic', type: 'category', values: config.initStatistics(dimensions), default: config.initStatistics(dimensions)[0], validate: (v, o)=> o.values.includes(v)};
            this.options.push(statistics);
            let sample_size = {name: 'Sample Size', type: "number", range: [0, 'max'], default: 10, validate: (v, o)=> (v > o.range[0] && v < o.range[1])};
            this.options.push(sample_size);
        },
        inCI: function(distribution_sorted, dist_element, population_statistic){
            let top_index = Math.floor(distribution_sorted.length * 0.95);
            let middle_95 = distribution_sorted.slice(0, top_index);
            return middle_95.includes(dist_element);
        },
        generateInCi: function(dimensions){
            if(dimensions.length < 1) return;

            this.inCI = function(distribution_sorted, dist_element, population_statistic){
                return population_statistic >= dist_element.CI_range[0] && population_statistic <= dist_element.CI_range[1];
            }
            
        },
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
        generateDistribution: function(dataset, stat){
            let sample_std = dataset.statistics.std;
            let sample_se = sample_std / Math.sqrt(dataset.all.length);
            let multiplier = 1.96;
            let stat_value = dataset.statistics[stat];
            let CI_range = [stat_value - (multiplier * sample_se), stat_value + (multiplier * sample_se)];
            return {"point_value": stat_value, "CI_range": CI_range};
        },
        labels:["Population", "Sample", "CI History"],
        playSectionLabels:["Sampling","CI History", "Statistics"]
    },
    "Bootstrapping": {
        name: "Bootstrapping",
        baseHTML: generateModuleHTML,
        baseControls: generateFileControls,
        allowedVariables:[['n', null], ['c', null], ['n', 'c'], ['c','c']],
        sampleSize:config.sampleSizeOptions['fullRange'],
        generateOptions: function(dimensions){
            if(dimensions.length < 1) return;
            this.options = [];
            let statistics = {name: 'Statistic', type: 'category', values: config.initStatistics(dimensions), default: config.initStatistics(dimensions)[0], validate: (v, o)=> o.values.includes(v)};
            this.options.push(statistics);
            //if(dimensions[0].type == 'numeric'){
                let pop_size = model.getPopulationSize();
                let sample_size = {name: 'Sample Size', type: "number", hide_option: true, range: [pop_size, pop_size], default: pop_size, validate: (v, o)=> (v >= o.range[0] && v <= o.range[1])};
                this.options.push(sample_size);                this.options.push(sample_size);
            //}
        },
        inCI: function(distribution_sorted, dist_element, population_statistic){
            let top_index = Math.floor(distribution_sorted.length * 0.95);
            let middle_95 = distribution_sorted.slice(0, top_index);
            return middle_95.includes(dist_element);
        },
        generateInCi: function(dimensions){
            if(dimensions.length < 1) return;
            if(dimensions.length > 1 && dimensions[1].factors.length > 2){
                this.inCI = function(distribution_sorted, dist_element, population_statistic){
                    return dist_element.point_value > population_statistic;
                }
            }else{
                this.inCI = function(distribution_sorted, dist_element, population_statistic){
                    let top_index = Math.floor(distribution_sorted.length * 0.95);
                    let middle_95 = distribution_sorted.slice(0, top_index);
                    return middle_95.includes(dist_element);
                }
            }
        },
        options: [{name: 'Statistic', type: 'category', values: ["Mean", "Median"], default: "Mean", validate: (v, o)=> o.values.includes(v)}, 
                    ],
        generateSample:function(population_rows, sampleSize,){
            // Each sample should be sampleSize elements taken from the pop
            // with replacement (CAN take the same element twice).
            var sample = [];
            for(var i = 0; i < sampleSize; i++){
                // Pick a random element
                var popIndex = Math.floor(d3.randomUniform(population_rows.length)());
                sample = sample.concat(population_rows.slice(popIndex,popIndex+1));

            }
            return sample;
        },
        generateDistribution: function(dataset, stat){
            return {"point_value": dataset.statistics[stat]};
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
        generateOptions: function(dimensions, num){
            if(dimensions.length < 1) return;
            this.options = [];
            let statistics = {name: 'Statistic', type: 'category', values: config.initStatistics(model.getSampleDimensions()), default: config.initStatistics(model.getSampleDimensions())[0], validate: (v, o)=> o.values.includes(v)};
            this.options.push(statistics);
            let groups = {name: 'Groups', type: "number", range: [0, 5], default: num || 2, validate: (v, o)=> {
                let valid =  v > o.range[0] && v < o.range[1];
                if(!valid) return false;
                model.module_options['Groups'] = v;
                let stat_values = config.initStatistics(model.getSampleDimensions());
                for(let o = 0; o < model.selected_module.options.length; o++){
                    let option = model.selected_module.options[o];
                    if(option.name == 'Statistic'){
                        option.values = stat_values;
                        option.default = stat_values[0];
                        model.module_options[option.name] = option.default;
                        oc_refresh_option(option.name, option, option.default);
                    }
                }
                return true;
            }};
            this.options.push(groups);
            //if(dimensions[0].type == 'numeric'){
                let pop_size = model.getPopulationSize();
                let sample_size = {name: 'Sample Size', type: "number", hide_option: true, range: [pop_size, pop_size], default: pop_size, validate: (v, o)=> (v >= o.range[0] && v <= o.range[1])};
                this.options.push(sample_size);
            //}
        },
        inCI: function(distribution_sorted, dist_element, population_statistic){
            return true;
        },
        generateInCi: function(dimensions){
            if(dimensions.length < 1) return;
            if(dimensions.length > 1 && dimensions[1].factors.length > 2){
                this.inCI = function(distribution_sorted, dist_element, population_statistic){
                    return true;
                }
            }else{
                this.inCI = function(distribution_sorted, dist_element, population_statistic){
                    return true;
                }
            }
        },
        options: [{name: 'Statistic', type: 'category', values: ["Mean", "Median"], default: "Mean", validate: (v, o)=> o.values.includes(v)}, 
                {name: 'Groups', type: "number", range: [0, 5], default: 2, validate: (v, o)=> (v > o.range[0] && v < o.range[1])}],
        generateSample:function(population_rows, sampleSize){
            // Sample Elements are the same as the population elements,
            // but with either A or B set as the group.
            var sample = [];
            for(var i = 0; i < sampleSize; i++){
                // Pick a random element and copy it.
                var popItem = $.extend(true, {}, population_rows.slice(i,i+1)[0]);
                // var group = Math.random();
                // var group_index = Math.floor(group/(1/this.sampleGroups.length));
                let group = Math.floor(Math.random() * model.getOptions()['Groups']);
                let dims = model.getSampleDimensions();
                popItem[dims[1].name] = dims[1].factors[group];
                sample.push(popItem);

            }
            return sample;
        },
        generateDistribution: function(dataset, stat){
            return {"point_value": dataset.statistics[stat]};
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
        generateOptions: function(dimensions){
            if(dimensions.length < 1) return;
            this.options = [];
            let statistics = {name: 'Statistic', type: 'category', values: config.initStatistics(dimensions), default: config.initStatistics(dimensions)[0], validate: (v, o)=> o.values.includes(v)};
            this.options.push(statistics);
            if(true){
            // if(dimensions[0].type == 'numeric'){
                let pop_size = model.getPopulationSize();
                let sample_size = {name: 'Sample Size', type: "number", hide_option: true, range: [pop_size, pop_size], default: pop_size, validate: (v, o)=> (v >= o.range[0] && v <= o.range[1])};
                this.options.push(sample_size);
            }
        },
        inCI: function(distribution_sorted, dist_element, population_statistic){
            let top_index = Math.floor(distribution_sorted.length * 0.95);
            let middle_95 = distribution_sorted.slice(0, top_index);
            return middle_95.includes(dist_element);
        },
        generateInCi: function(dimensions){
            if(dimensions.length < 1) return;
            // if(dimensions.length > 1 && dimensions[1].factors.length > 2){
                this.inCI = function(distribution_sorted, dist_element, population_statistic){
                    return dist_element.point_value > population_statistic;
                }
            // }else{
            //     this.inCI = function(distribution_sorted, dist_element, population_statistic){
            //         let top_index = Math.floor(distribution_sorted.length * 0.95);
            //         let middle_95 = distribution_sorted.slice(0, top_index);
            //         return middle_95.includes(dist_element);
            //     }
            // }
        },
        options: [{name: 'Statistic', type: 'category', values: ["Mean", "Median"], default: "Mean", validate: (v, o)=> o.values.includes(v)}, 
                ],
        generateSample:function(population_rows, sampleSize,){
            // Sample Elements are the same as the population elements,
            // but with the second dimension randomised, keeping the number of elements in 
            // each the same.
            var sample = [];
            var categories = model.dimensions[1].factors;
            // Get the number of elements in each category
            var newCategories = [];
            for(var c in categories){
                var category = categories[c];
                var numInCategory = population_rows.filter((e)=>e[model.dimensions[1].name] == category).length;
                newCategories = newCategories.concat(Array(numInCategory).fill(c));
            }
            d3.shuffle(newCategories);
            for(var i = 0; i < sampleSize; i++){
                // Pick a random element and copy it.
                var popItem = $.extend(true, {}, population_rows.slice(i,i+1)[0]);
                
                var group = newCategories[i];
                popItem[model.dimensions[1].name] = categories[group];
                sample.push(popItem);

            }
            return sample;
        },
        generateDistribution: function(dataset, stat){
            return {"point_value": dataset.statistics[stat]};
        },
        labels:['Data','Re-Randomised Data','Re-Randomisation Distribution'],
        playSectionLabels:["Sampling","Sampling Distribution", "Statistics"],

    }
}