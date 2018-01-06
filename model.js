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
    getDefaultOptions: function(){
        let options = this.selected_module.options;
        for(let i in options){
            let option = options[i];
            this.module_options[option.name] = option.default;
        }
    },
    getOptions: function(){
        return this.module_options;
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
        for(var r in this.parsedData){
            var row = this.parsedData[r];
            for(var c in row){
                var el = row[c];
                delete row[c];
                row[c.trim()] = config.NA.some((e)=>e==el) ? 0 : el.trim();
            }
        }
        console.log(this.parsedData);
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
        reader.onload = function(e){
            let csv = e.target.result;
            self.parseCSV(csv);
        };
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
        for(let d = 0; d < this.dimensions.length; d++){
            focus.push(this.dimensions[d].focus || this.dimensions[d].factors[0]);
        }
        return focus;
    },

    setDimensionFocus: function(focus, dim){
        if($.inArray(focus, this.dimensions[dim].factors)){
            this.dimensions[dim].focus = focus;
        }
    },

    cleanData: function(){
        this.cleanedData = [];
        for(var r in this.parsedData){
            if(r == 'columns') break;
            var row = this.parsedData[r];
            this.cleanedData.push({id: r});
            for(var d in this.dimensions){
                let dim = this.dimensions[d];
                var el = row[dim.name];
                if(dim.type == 'numeric') el = parseFloat(el);
                this.cleanedData[r][dim.name] = el;
            }
        }
    },

    populationDataset: function(){
        this.cleanData();
        this.populationDS = createDataset(this.cleanedData, this.dimensions, this.genStatistics(this.cleanedData));
        return this.populationDS;
    },

    genStatistics: function(cleanedData){
        let generator = {overall: [], // Statistics across all datapoints, I.E mean of everything
            fac1: [], // Statistics for each category of factor 1
            fac2: [], // Statistics for each category of factor 2
            both: []}; // Statistics for each combination of fac1, fac 2.
        if(this.dimensions[0].type == 'numeric'){
            generator.overall.push(meanGen('meanX', this.dimensions[0].name));
            generator.fac2.push(meanGen('meanX', this.dimensions[0].name));
            generator.both.push(meanGen('meanX', this.dimensions[0].name));
        }else{
            generator.fac1.push(propGen('propX', this.dimensions[0].name, cleanedData.length));
            if(this.dimensions.length > 1) generator.fac2.push(propGen('propY', this.dimensions[1].name, cleanedData.length));
            generator.both.push(propGen('propX', this.dimensions[0].name, cleanedData.length));
            if(this.dimensions.length > 1) generator.both.push(propGen('propY', this.dimensions[1].name, cleanedData.length));
        }
        return generator;
    }

}