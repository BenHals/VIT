function createDataset(data, dimensions, statistics_generator){
    let dataset = {};
    dataset.all = [];
    dimensions.forEach(dim => {
        dataset[dim.name] = {};
        let own_factors = dim.factors;
        own_factors.forEach((own_fac)=>{
            dataset[dim.name]["own"+own_fac] = {};
            dataset[dim.name]["own"+own_fac].all = [];
            dimensions.forEach(dimSec => {
                if(dim == dimSec) return;
                dataset[dim.name]["own"+own_fac][dimSec.name] = {};
                let sec_factors = dimSec.factors;
                sec_factors.forEach((sec_fac)=>{
                    dataset[dim.name]["own"+own_fac][dimSec.name][sec_fac] = {};
                    dataset[dim.name]["own"+own_fac][dimSec.name][sec_fac].all = [];
                });
            });
        });
        dimensions.forEach(dimSec => {
            if(dim == dimSec) return;
            dataset[dim.name][dimSec.name] = {};
            let sec_factors = dimSec.factors;
            sec_factors.forEach((sec_fac)=>{
                dataset[dim.name][dimSec.name][sec_fac] = {};
                dataset[dim.name][dimSec.name][sec_fac].all = [];
            });
        });
    });
    for(let r = 0; r < data.length; r++){
        let row = data[r];
        dataset.all.push(row);
        dimensions.forEach(dim => {
            let row_value_own = row[dim.name];
            let row_fac_own = dim.type == 'categoric' ? row_value_own : "";
            //dataset[dim.name].all.push(row);
            let own_factors = dim.factors;
            own_factors.forEach((own_fac)=>{
                if(row_fac_own != own_fac) return;
                dataset[dim.name]["own"+own_fac].all.push(row);
                dimensions.forEach(dimSec => {
                    if(dim == dimSec) return;
                    let row_value_sec = row[dimSec.name];
                    let row_fac_sec = dimSec.type == 'categoric' ? row_value_sec : "";
                    //dataset[dim.name]["own"+own_fac][dimSec.name].all.push(row);
                    let sec_factors = dimSec.factors;
                    sec_factors.forEach((sec_fac)=>{
                        if(row_fac_sec != sec_fac) return;
                        dataset[dim.name]["own"+own_fac][dimSec.name][sec_fac].all.push(row);
                    });
                });
            });
            dimensions.forEach(dimSec => {
                if(dim == dimSec) return;
                let row_value_sec = row[dimSec.name];
                let row_fac_sec = dimSec.type == 'categoric' ? row_value_sec : "";
                //dataset[dim.name][dimSec.name].all.push(row);
                let sec_factors = dimSec.factors;
                sec_factors.forEach((sec_fac)=>{
                    if(row_fac_sec != sec_fac) return;
                    dataset[dim.name][dimSec.name][sec_fac].all.push(row);
                });
            });
        });
    }

    dataset.statistics = runStatGens(dataset.all, statistics_generator.overall);
    dimensions.forEach((dim, i) => {
        let own_factors = dim.factors;
        own_factors.forEach((own_fac)=>{
            dataset[dim.name]["own"+own_fac].statistics = runStatGens(dataset[dim.name]["own"+own_fac].all, statistics_generator['fac'+(i+1)]);
            dimensions.forEach(dimSec => {
                if(dim == dimSec) return;
                let sec_factors = dimSec.factors;
                sec_factors.forEach((sec_fac)=>{
                    dataset[dim.name]["own"+own_fac][dimSec.name][sec_fac].statistics = runStatGens(dataset[dim.name]["own"+own_fac][dimSec.name][sec_fac].all, statistics_generator['both']);
                });
            });
        });
        dimensions.forEach(dimSec => {
            if(dim == dimSec) return;
            let sec_factors = dimSec.factors;
            sec_factors.forEach((sec_fac)=>{
                dataset[dim.name][dimSec.name][sec_fac].statistics = runStatGens(dataset[dim.name][dimSec.name][sec_fac].all, statistics_generator['fac' + (2-i)]);
            });
        });
    });
    console.log(dataset);
    return dataset;
}

function runStatGens(datapoints, functions){
    let stats = {};
    for(let f in functions){
        stats[functions[f][0]] = functions[f][1](datapoints);
    }
    return stats;
}

function meanGen(stat_name, dim_name){
    return [stat_name, function(dp){return dp.reduce((a, c)=>{return a+c[dim_name]}, 0) / dp.length}];
}
function propGen(stat_name, dim_name, total){
    return [stat_name, function(dp){return dp.length / total}];
}