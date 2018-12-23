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
    return [stat_name, function(dp){
        dp = dp || [];
        if(dp.length < 1) return 0;
        let sum = dp.reduce((a, c)=>{return a+parseFloat(c[dim_name]) || 0}, 0);
        let avg = sum / dp.length;
        return isNaN(avg) ? 0 : avg;
    }];
}
function stdGen(stat_name, dim_name, focus){
    return [stat_name, function(dp){
        dp = dp || [];
        if(dp.length < 1) return 0;
        let values = dp.map(function(c){
            let val = c[dim_name];

            // Account for categorical, A categorical value is a category name so we convert to 0 or 1.
            if(isNaN(val)){
                val = val == focus ? 1 : 0;
            }
            return val;
        });
        let std = d3.deviation(values);
        return isNaN(std) ? 0 : std;
    }];
}
function medianGen(stat_name, dim_name){
    return [stat_name, function(dp){
        if (dp.length < 1) return 0;
        let sorted = dp.sort((a, b)=> a[dim_name] - b[dim_name]);
        let mid_ceil = sorted[Math.floor((dp.length - 1) / 2)];
        let mid_floor = sorted[Math.ceil((dp.length - 1) / 2)];
        if(mid_ceil == undefined || mid_floor == undefined){
            console.log(dp);
            return 0;
        }
        
        return (mid_ceil[dim_name] + mid_floor[dim_name])/2;
    }];
}
function lqGen(stat_name, dim_name){
    return [stat_name, function(dp){
        if (dp.length < 1) return 0;
        let sorted = dp.sort((a, b)=> a[dim_name] - b[dim_name]);
        let mid_ceil = sorted[Math.floor((dp.length - 1) / 4)];
        let mid_floor = sorted[Math.ceil((dp.length - 1) / 4)];
        if(mid_ceil == undefined || mid_floor == undefined){
            console.log(dp);
            return 0;
        }
            
        return (mid_ceil[dim_name] + mid_floor[dim_name])/2;
    }];
}
function uqGen(stat_name, dim_name){
    return [stat_name, function(dp){
        if (dp.length < 1) return 0;
        let sorted = dp.sort((a, b)=> a[dim_name] - b[dim_name]);
        let mid_ceil = sorted[Math.floor(((dp.length - 1) / 4) * 3)];
        let mid_floor = sorted[Math.ceil(((dp.length - 1) / 4) * 3)];
        if(mid_ceil == undefined || mid_floor == undefined){
            console.log(dp);
            return 0;
        }
            
        return (mid_ceil[dim_name] + mid_floor[dim_name])/2;
    }];
}
function propGen(stat_name, dim_name, focus, total){
    return [stat_name, function(dp){
        if(dp.length == 0) return 0;
        return (dp && dp.length > 1) ? dp.reduce((a, c) => c[dim_name] == focus ? a + 1 : a, 0) / dp.length : dp[0][dim_name] == focus;
    }];
}

function avDev(stat_name, dim_name, dim_name2, factors, mid_stat){
    return [stat_name, function(dp){
        let mean = mid_stat(dp);
        let avg = 0;
        for(let f = 0; f < factors.length; f++){
            let set_of_factors = dp.filter((e)=>e[dim_name2] == factors[f]);
            let test = mid_stat(set_of_factors);
            if(isNaN(test)){
                test = mid_stat(set_of_factors);
            }
            let factor_mean = mid_stat(dp.filter((e)=>e[dim_name2] == factors[f]));
            avg += Math.abs( mean - factor_mean);
        }
        return avg / factors.length;
    }];
}

function fStat(stat_name, dim_name, dim_name2, factors, mid_stat){
    return avDev(stat_name, dim_name, dim_name2, factors, mid_stat);
}

function slopeGen(stat_name, dim_name, dim_name2){
    return [stat_name, function(dp){
        let mean_x = meanGen('', dim_name)[1](dp);
        let mean_y = meanGen('', dim_name2)[1](dp);
        let covar = dp.reduce((a, c)=> {
            let x = (c[dim_name] - mean_x);
            let y = (c[dim_name2] - mean_y);
            return a + (x*y)}, 0);
        let x_var = dp.reduce((a, c)=> a + ((c[dim_name] - mean_x)*(c[dim_name] - mean_x)), 0);
        let slope = covar / x_var;
        return slope;
    }];
}

function interceptGen(stat_name, dim_name, dim_name2){
    return [stat_name, function(dp){
        let mean_x = meanGen('', dim_name)[1](dp);
        let mean_y = meanGen('', dim_name2)[1](dp);
        let slope = slopeGen(stat_name, dim_name, dim_name2)[1](dp);
        let intercept = mean_y - slope*mean_x;
        return intercept;
    }];
}