importScripts('dataset.js');  
onmessage = function(e){
    let [population_data, sample_size, sample_generator] = e.data;
    let sample = sample_generator(population_data, sample_size);
    postMessage(createDataset(sample, this.dimensions, this.genStatistics(sample)));
}
