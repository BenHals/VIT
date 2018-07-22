const model = {
    selected_module: undefined,
    use_old: true,
    file: undefined,
    parsedData: undefined,
    selected_columns: new Set(),
    dimensions: [],
    module_options: {},


    setSelectedModule: function(module){
        this.selected_module = module;
        this.getDefaultOptions();
    },
    getDefaultOptions: function(d){
        this.selected_module.generateOptions(this.dimensions, d);
        this.selected_module.generateInCi(this.dimensions);
        let options = this.selected_module.options;
        let options_url = JSON.parse(getURLParameter(window.location.href, 'options')) || {};
        for(let i in options){
            let option = options[i];
            let url_value = option.name in options_url ? options_url[option.name] : null;
            
            this.module_options[option.name] = (url_value && option.validate(url_value, option)) ? url_value : option.default;
        }
        //this.setStatisticsValues();
    },
    setStatisticsValues: function(){
        let options = this.selected_module.options;
        for(let i in options){
            let option = options[i];
            if(option.name == "Statistic" && this.dimensions.length > 0){
                let stat_values = config.initStatistics(this.dimensions);
                option.values = stat_values;
                option.default = stat_values[0];
                this.module_options[option.name] = option.default;
            } 
        }
    },
    getOptions: function(){
        return this.module_options;
    },
    setOption: function(option_name, value){
        this.module_options[option_name] = value;
    },
    getModuleName: function(){
        return this.selected_module.name;
    },
    useOld: function(){
        return this.use_old;
    },

    getExampleFileNames: async function(){
        let file_names = [];
        let p = await new Promise((resolve, reject) => {
            var xhr = createCORSRequest('GET', config.server + "filegetTest.php");
            if (!xhr) {
                throw new Error('CORS not supported');
            }
            xhr.onload = function() {
                var text = xhr.responseText;
                resolve(JSON.parse(text));
            };
    
            xhr.onerror = function() {
                reject("error in example file list get");
            };
    
            xhr.send();
        }).then((files)=>{file_names = files});

        return file_names;
    },
    setFile: function(file){
        this.file = file;
    },

    parseCSV: function(csv){
        if(csv.slice(0, 20).indexOf("DOCTYPE") != -1) return;
        this.parsedData = d3.csvParse(csv);
        invalid_rows = [];
        for(var r in this.parsedData){
            var row = this.parsedData[r];
            let has_invalid = false;
            for(var c in row){
                var el = row[c];
                delete row[c];
                if(config.NA.some((e)=>e==el)){
                    has_invalid = true;
                    continue
                }
                row[c.trim()] = isNaN(el.trim()) ? el.trim() : el.trim() * 1;
            }
            if(has_invalid){
                invalid_rows.push(r);
            }
        }
        // for(let i = invalid_rows.length - 1; i >= 0; i--){
        //     this.parsedData.splice(invalid_rows[i], 1);
        // }
    },

    formatData: async function(){
        // data = [row1: {col1:val, col2:val, ...}, row2...]
        let data = this.parsedData;
        let columns = {};
        let column_values = {};

        // column_values = {col1: [val, val, ...], col2: [val, val, ...], ...}
        data.columns.forEach((column_name) => {
            columns[column_name] = {name: column_name};
            let value_array = data.map((row) => isNaN((row[column_name])) ? row[column_name] : parseFloat(row[column_name]));
            value_array = value_array.filter((row) => row != undefined);
            column_values[column_name] = value_array;
            columns[column_name].type = !value_array.some(isNaN) ? 'numeric' : 'categoric';
            if(columns[column_name].type == 'numeric'){
                columns[column_name].factors = [""];
            }else{
                columns[column_name].factors = [...new Set(value_array)];
            }
        });

        this.columns = columns;
        this.column_values = column_values;

        return columns;
    },

    getLocalFile: async function(file){
        let self = this;
        self.setFile(file);
        let reader = new FileReader();
        reader.readAsText(file);
        this.dataSplit = {};
        let p = new Promise((resolve, reject)=>{
            reader.onload = function(e){
                let csv = e.target.result;
                self.parseCSV(csv);
                resolve(csv);
            };
        }).then((data)=>{controller.fileParsed()});

    },

    getUrlFile: async function(url){
        let self = this;
        let p = await new Promise((resolve, reject) => {
            let encoded_url = encodeURIComponent(url);
            var xhr = createCORSRequest('GET', config.server + "getFileFromURL.php"+"?fn=" +encoded_url);
            if (!xhr) {
                reject('CORS not supported');
            }
            xhr.onload = function() {
                var text = xhr.responseText;
                resolve(text);
            };
            xhr.onerror = function() {
                reject('Woops, there was an error making the url file request.');
            };
            xhr.send();
        }).then((csv)=>{
            self.parseCSV(csv);
            self.setFile({name:url.split('?')});
            return "success";
        }, (err)=>{
            throw err;
        });
    },

    getExampleFile: async function(filename){
        let self = this;
        let p = await new Promise((resolve, reject) => {
            var xhr = createCORSRequest('GET', config.server + "getFileTest.php"+"?fn=" +filename);
            if (!xhr) {
                reject('CORS not supported');
            }
            xhr.onload = function() {
                var text = xhr.responseText;
                resolve(text);
            };
            xhr.onerror = function() {
                reject('Woops, there was an error making the request.');
            };
            xhr.send();
        }).then((csv)=>{
            self.parseCSV(csv);
            self.setFile({name:filename});
            return "success";
        }, (err)=>{
            throw err;
        });
    },

    getColumnNames: function(){
        if(this.columns){
            return Object.values(this.columns).map((col)=>col.name);
        }else{
            return undefined;
        }
    },

    getColumnNamesTypes: function(){
        if(this.columns){
            return Object.values(this.columns).map((col)=>[col.name, col.type]);
        }else{
            return undefined;
        }
    },

    getSelectedColumnsNames: function(){
        return [...this.selected_columns].map((col)=>col.name);
    },

    getSelectedColumns: function(){
        return [...this.selected_columns];
    },

    newColumnReset: function(){
        Object.values(this.columns).forEach((col)=>{
            col.focus = undefined;
        });
    },

    columnSelection: function(selected_labels){
        // Select inputs dont have ordering, so we must keep track ourselves
        let selOptions = new Set(selected_labels);
        for (let index = 0; index < selected_labels.length; index++){
            this.selected_columns.add(this.columns[selected_labels[index]]);
        }
        let set_items = [...this.selected_columns];
        for (let index = 0; index < set_items.length; index++){
            if(!selOptions.has(set_items[index].name)){
                this.selected_columns.delete(set_items[index]);
            }
        }
    
        return [...this.selected_columns];   
    },

    setDimensions: function(){
        this.dimensions = [...this.selected_columns];
        this.setDimensionType(this.dimensions);
        this.getDefaultOptions();
        let options = this.selected_module.options;
        //this.setStatisticsValues();
        
    },

    setDimensionType: function(dimensions){
        let stat_type = null;
        let has_factors = false;
        if(dimensions.length < 2){
            stat_type = dimensions[0].type == 'numeric' ? 'single-mean' : 'single-prop';
        }else if(dimensions.length == 2){
            if(dimensions[1].type == 'numeric'){
                stat_type = 'slope';
            }else if(dimensions[1].factors.length == 2){
                stat_type = dimensions[0].type == 'numeric' ? 'diff-mean' : 'diff-prop';
                has_factors = true;
            }else if(dimensions[1].factors.length > 2){
                stat_type = dimensions[0].type == 'numeric' ? 'multi-mean' : 'multi-prop';
                has_factors = true;
            }
        }
        dimensions.stat_type = stat_type;
        dimensions.has_factors = has_factors;
    },

    getSampleDimensions: function(){
        if(this.selected_module.name != "Randomisation Variation"){
            return this.dimensions;
        }else{
            let num_groups = this.getOptions()['Groups'];
            let group_names = ["A", "B", "C", "D", "E"];
            let new_dimension = {name: "synthetic", type: "categoric", factors: group_names.slice(0, num_groups)};
            let s_dimension = this.dimensions.concat([new_dimension]);
            this.setDimensionType(s_dimension);
            return s_dimension;
        }
    },

    getDimensionFactors: function(){
        let factors = [];
        for(let d = 0; d < this.dimensions.length; d++){
            factors.push(this.dimensions[d].factors);
        }
        return factors;
    },

    getDimensionFocus: function(){
        let focus = [];
        let url_focus = getURLParameter(window.location.href, 'focus');
        for(let d = 0; d < this.dimensions.length; d++){
            focus.push(this.dimensions[d].focus || url_focus || this.dimensions[d].factors[0]);
        }
        return focus;
    },

    setDimensionFocus: function(focus, dim){
        if(this.dimensions[dim].factors.includes(focus)){
            this.dimensions[dim].focus = focus;
        }
    },

    cleanData: function(){
        this.cleaned_data = [];
        let id_val = 0;
        for(var r in this.parsedData){
            if(r == 'columns') break;
            var row = this.parsedData[r];
            let row_obj = {id: id_val};
            let is_valid = true;
            for(var d in this.dimensions){
                let dim = this.dimensions[d];
                var el = row[dim.name];
                if(dim.type == 'numeric') el = parseFloat(el);
                if(config.NA.some((e)=>e==el) || (dim.type == 'numeric' && isNaN(el)))
                    is_valid = false;
                row_obj[dim.name] = el;
            }
            if(is_valid){
                this.cleaned_data.push(row_obj);
                id_val += 1;
            }

        }
    },

    populationDataset: function(){
        this.cleanData();
        let stat = this.genStatistics(this.cleaned_data, this.dimensions);
        this.populationDS = createDataset(this.cleaned_data, this.dimensions, stat);
        // want to sort factors in terms of statistic
        if(this.dimensions.has_factors && this.dimensions[0].type == 'numeric'){
            let factors = this.populationDS[this.dimensions[0].name][this.dimensions[1].name];
            this.dimensions[1].factors.sort((a, b)=> {
                return factors[a].statistics["Mean"] - factors[b].statistics["Mean"];
            });
        }
        return this.populationDS;
    },

    getPopulationSize: function(){
        if(!this.populationDS) return this.parsedData.length;
        return this.populationDS.all.length;
    },

    genStatistics: function(cleaned_data, dimensions){
        let generator = {overall: [], // Statistics across all datapoints, I.E mean of everything
            fac1: [], // Statistics for each category of factor 1
            fac2: [], // Statistics for each category of factor 2
            both: []}; // Statistics for each combination of fac1, fac 2.
        if(dimensions[0].type == 'numeric'){
            generator.overall.push(meanGen('Mean', dimensions[0].name));
            generator.fac2.push(meanGen('Mean', dimensions[0].name));
            generator.both.push(meanGen('Mean', dimensions[0].name));
            generator.overall.push(medianGen('Median', dimensions[0].name));
            generator.fac2.push(medianGen('Median', dimensions[0].name));
            generator.both.push(medianGen('Median', dimensions[0].name));
            if(dimensions.length > 1){
                generator.overall.push(avDev('Average Deviation', dimensions[0].name, dimensions[1].name, dimensions[1].factors, meanGen('', dimensions[0].name)[1]));
                generator.overall.push(fStat('F Stat', dimensions[0].name, dimensions[1].name, dimensions[1].factors, meanGen('', dimensions[0].name)[1]));
                generator.overall.push(slopeGen('Slope', dimensions[0].name, dimensions[1].name));
                generator.overall.push(interceptGen('Intercept', dimensions[0].name, dimensions[1].name));
            }

        }else{
            if(dimensions.length > 1) generator.fac2.push(propGen('proportion', dimensions[0].name, dimensions[0].focus, cleaned_data.length));
            generator.overall.push(propGen('proportion', dimensions[0].name, dimensions[0].focus, cleaned_data.length));
            if(dimensions.length > 1){
                generator.overall.push(avDev('Average Deviation', dimensions[0].name, dimensions[1].name, dimensions[1].factors, propGen('', dimensions[0].name, dimensions[0].focus, cleaned_data.length)[1] ));
                generator.overall.push(fStat('F Stat', dimensions[0].name, dimensions[1].name, dimensions[1].factors, propGen('', dimensions[0].name, dimensions[0].focus, cleaned_data.length)[1]));
            }

        }
        return generator;
    },
    
    takeSamples: async function(){
        let population_data = this.cleaned_data;
        let sample_size = this.getOptions()["Sample Size"];
        let sample_generator = this.selected_module.generateSample;
        this.samples = [];
        this.distribution = [];
        let stat = model.getOptions()["Statistic"];
        for(let i = 1; i <= 1000; i++){
            let sample_dataset = null;
            setTimeout(()=> {this.genSample(population_data, sample_size, sample_generator, stat, i)}, 0);
        }
    },
    genSample: async function(population_data, sample_size, sample_generator, stat, i){
        // if(window.Worker){
        //     let data = null;
        //     let p = new Promise((resolve, reject)=>{
        //         let worker = new Worker('./sampleWorker.js');
        //         worker.postMessage([population_data, sample_size, sample_generator]);
        //         worker.onmessage((e)=> resolve(e.data[0]));
        //     }).then((ds)=>{
        //         this.distribution.push(ds.statistics[stat]);
        //         this.samples.push(ds);
        //         controller.updateSampleProgress(i/1000);
        //     });


        // }else{
            let sample = sample_generator(population_data, sample_size);
            let ds = createDataset(sample, this.getSampleDimensions(), this.genStatistics(sample, this.getSampleDimensions()));
            let dim = this.getSampleDimensions();
            let stat_value = ds.statistics[stat];
            if(dim.length > 1 && dim[1].factors.length == 2){
                let f0_stat = ds[dim[0].name][dim[1].name][dim[1].factors[0]].statistics[stat];
                let f1_stat = ds[dim[0].name][dim[1].name][dim[1].factors[1]].statistics[stat];
                stat_value = f1_stat - f0_stat;
            }
            this.distribution.push(stat_value);
            this.samples.push(ds);
            controller.updateSampleProgress(i/1000);
        //}
    },

    resetAll: function(){
        this.samples = null;
        this.dimensions = null;
        this.selected_columns = new Set();
        this.populationDS = null;
        this.module_options = [];
    }

}

function getYFactors(dimensions){
    return dimensions.length < 2 || dimensions[1].type == 'numeric' ? [""] : dimensions[1].factors;
}

function getYFactorName(dimensions){
    return dimensions.length < 2 || dimensions[1].type == 'numeric' ? "" : dimensions[1].name;
}