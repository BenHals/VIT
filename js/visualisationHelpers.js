

function setupSection(dataset, ctx, displayArea){
    var proportionBar = new visElement('rect', 'population', ctx);
    var populationSections = [];

    // If there is no second dimension, all points are grouped.
    if(dataset.dimensions.length == 1){
        populationSections.push({data:dataset.allDataPoints, boundingBox:[0,0,displayArea.bbWidth, displayArea.bbHeight], statistics:dataset.statistics.overall, name:""});
    }else{
        var categories = dataset.dimensions[1].categories;
        var numCategories = categories.length;
        var test = dataset.allDataPoints.filter(function(d){return $.inArray(d.dimensionValues[1], categories) == -1});

        var sectionBoundingBox = displayArea.boundingBox; 
        var totalHeight = displayArea.bbHeight;

        var sectionHeight = totalHeight / numCategories;
        for(var cat = 0; cat < numCategories; cat++){
            var catagoryName = categories[cat];
            var bbox = [0, sectionHeight * cat, displayArea.bbWidth, sectionHeight * (cat + 1)];
            var data = dataset.allDataPoints.filter(function(d){return d.dimensionValues[1] == catagoryName;});
            populationSections.push({data:data, boundingBox:bbox, statistics:dataset.statistics.grouped[catagoryName], name:catagoryName});
        }
    }
    return populationSections;
}

function setupProportional(dataset, ctx, displayArea, proportionScale, populationSections){
    var dynamicElements = [];
    for(var s in populationSections){
        dynamicElements.push([]);
        var section = populationSections[s];
        var sectionElement = new visElement('rect', 'populationSection' + s, ctx);
        displayArea.addChild(sectionElement);
        sectionElement.setRelativeBoundingBox(section.boundingBox[0],section.boundingBox[1],section.boundingBox[2],section.boundingBox[3], displayArea.boundingBox);

        var focusProportion = section.statistics.focusProportion;
        var focusBarWidth = proportionScale(focusProportion) - proportionScale(0);
        var focusBar = new visElement('rect', 'populationSection' + s +'focus', ctx);
        sectionElement.addChild(focusBar);
        focusBar.setRelativeBoundingBox(0, sectionElement.bbHeight*(1/4),focusBarWidth,sectionElement.bbHeight*(3/4), sectionElement.boundingBox);
        focusBar.drawSelf = drawProportionBar.bind(focusBar, proportionColorsList[0]);
        var focusBarLabel = new visElement('text', 'populationSection' + s +'focusLabel', ctx);
        focusBarLabel.setText(focusProportion > 0.001 ? dataset.dimensions[0].categories[0] : "");
        focusBarLabel.setTextColor(proportionColorsList[0]);
        focusBar.addChild(focusBarLabel);
        focusBarLabel.setRelativeBoundingBox(0, sectionElement.bbHeight*(1/4) + sectionElement.bbHeight/8, 20 ,sectionElement.bbHeight*(1/4), sectionElement.boundingBox);

        var otherProportion = 1- section.statistics.focusProportion;
        var otherBarWidth = proportionScale(otherProportion) - proportionScale(0);
        var otherBar = new visElement('rect', 'populationSection' + s +'other', ctx);
        sectionElement.addChild(otherBar);
        otherBar.setRelativeBoundingBox(focusBarWidth, sectionElement.bbHeight*(1/4),otherBarWidth + focusBarWidth,sectionElement.bbHeight*(3/4), sectionElement.boundingBox);
        otherBar.drawSelf = drawProportionBar.bind(otherBar, proportionColorsList[1]);
        var otherBarLabel = new visElement('text', 'populationSection' + s +'otherLabel', ctx);
        var otherBarText = dataset.dimensions[0].categories.length == 2 ? dataset.dimensions[0].categories[1] : 'Other';
        otherBarLabel.setText(otherProportion > 0.001 ? otherBarText : "");
        otherBarLabel.setTextColor(proportionColorsList[1]);
        otherBar.addChild(otherBarLabel);
        otherBarLabel.setRelativeBoundingBox(focusBarWidth, sectionElement.bbHeight*(1/4) + sectionElement.bbHeight/8, focusBarWidth + 20 , sectionElement.bbHeight*(1/4), sectionElement.boundingBox);
    
        labelSection(sectionElement, ctx, section.name, s);
        dynamicElements[s].push(sectionElement);
    }
    return dynamicElements;
}

function setupNumerical(dataset, ctx, displayArea, numericalScale, populationSections){
    var dynamicElements = [];
    for(var s in populationSections){
        dynamicElements.push([]);
        var section = populationSections[s];
        var sectionElement = new visElement('rect', 'populationSection' + s, ctx);
        displayArea.addChild(sectionElement);
        sectionElement.setRelativeBoundingBox(section.boundingBox[0],section.boundingBox[1],section.boundingBox[2],section.boundingBox[3], displayArea.boundingBox);
        var datapoints = [];
        for(var d in section.data){
            var datapoint = section.data[d];
            var dataElement = new visElement('rect', 'populationDP' + s, ctx, datapoint.id);
            sectionElement.addChild(dataElement);
            dataElement.setBoundingBox(0,0,5,5);
            dataElement.setRelativeCenter(numericalScale(datapoint.dimensionValues[0]) - numericalScale(numericalScale.domain()[0]),sectionElement.bbHeight*(1/2), sectionElement.boundingBox);
            dataElement.drawSelf = drawDataPoint.bind(dataElement);
            dataElement.color = '#000000';
            dataElement.fill = true;
            datapoints.push(dataElement);
        }
        dynamicElements[s] = datapoints;
        var boxHeight = sectionElement.boundingBox[3] - sectionElement.boundingBox[1];
        var heapBB = [sectionElement.boundingBox[0], sectionElement.boundingBox[1] + boxHeight/2, sectionElement.boundingBox[2], sectionElement.boundingBox[3]];
        if(datapoints.length > 1) numericalHeap(datapoints, heapBB, true);
        labelSection(sectionElement, ctx, section.name, s);
    }
    return dynamicElements;

}

function numericalHeap(datapoints, boundingBox, changeValue){
    var numBuckets = 300;
    var bucketScale = d3.scaleQuantize().range(Array.from(Array(numBuckets).keys()));
    bucketScale.domain([boundingBox[0], boundingBox[2]]);
    var buckets = {};
    var tallestBucketHeight = 0;
    for(var d in datapoints){
        var datapoint = datapoints[d];
        var bucket = bucketScale(datapoint.centerX);
        if(!(bucket in buckets)) buckets[bucket] = [];
        buckets[bucket].push(datapoint);
        if(buckets[bucket].length > tallestBucketHeight) tallestBucketHeight = buckets[bucket].length;
    }
    var spaceAvaliable = boundingBox[3] - boundingBox[1];
    var spacePerElement = Math.min(spaceAvaliable/tallestBucketHeight, datapoints[0].bbHeight);
    for(var b in buckets){
        for(var e in buckets[b]){
            buckets[b][e].setAlternativeCenter([buckets[b][e].centerX, buckets[b][e].centerY]);
            buckets[b][e].setAlternativeCenter([buckets[b][e].centerX,  buckets[b][e].centerY - spacePerElement * e ]);
            if(changeValue) buckets[b][e].setCenter(buckets[b][e].centerX,  buckets[b][e].centerY - spacePerElement * e );
        }
    }
}

function labelSection(section, ctx, name, index){
    var sectionLabel = new visElement('text', 'populationSection' + name +'Label', ctx);
    sectionLabel.setText(name);
    section.addChild(sectionLabel);
    sectionLabel.setRelativeBoundingBox(section.bbWidth, 0, section.bbWidth, 0, section.boundingBox);
    sectionLabel.drawSelf = drawText.bind(sectionLabel, groupColorsList[index], 'hanging', 'end');
}

function setupPopAxis(popSectionAxisArea, popScale, ctx){
    var popAxis = new visElement('axis', 'populationSectionAxis', ctx);
    popAxis.setScale(popScale);
    popSectionAxisArea.addChild(popAxis);
    popAxis.setRelativeBoundingBox(0, 0, popSectionAxisArea.bbWidth, popSectionAxisArea.bbHeight, popSectionAxisArea.boundingBox);
    popAxis.drawSelf = drawAxis.bind(popAxis);
}

function setupLabel(label, labelArea, ctx){
    var sectionLabel = new visElement('text', "popLabel", ctx);
    sectionLabel.setText(label);
    labelArea.addChild(sectionLabel);
    sectionLabel.setRelativeBoundingBox(0, 0, 10, 10, labelArea.boundingBox);
    sectionLabel.drawSelf = drawText.bind(sectionLabel, 'black', 'hanging', 'start');
}

function setupPopStatistic(population, popSection, distSection, popScale, isPop, ctx){
    var statMarker;
    var statisticOfInterest;
    var stats, category, stat, section;
    var sampleStatMarkers = [];
    var distStatMarkers = [];
    if(population.dimensions.length == 1){
        // For 1 dimensional data just draw a marker at desired statistic
        statMarker = new visElement('line', 'popStatMarker', ctx);
        popSection.addChild(statMarker);
        var desiredStatistic = population.statistics.overall[state.statistic ? state.statistic : getStatisticsOptions()[0]];
        statMarker.setRelativeBoundingBox(popScale(desiredStatistic) - popSection.boundingBox[0], 0, popScale(desiredStatistic)- popSection.boundingBox[0], popSection.bbHeight, popSection.boundingBox);
        statMarker.drawSelf = drawLine.bind(statMarker, 'black', false);
        statMarker.setAlternateBB();
        sampleStatMarkers.push(statMarker);

        statMarker = new visElement('line', 'popStatMarker', ctx);
        distSection.addChild(statMarker);
        statMarker.setRelativeBoundingBox(popScale(desiredStatistic) - popSection.boundingBox[0], popSection.bbHeight*(3/4), popScale(desiredStatistic)- popSection.boundingBox[0], popSection.bbHeight, popSection.boundingBox);
        statMarker.drawSelf = drawLine.bind(statMarker, 'steelblue', false);
        statMarker.setAlternateBB();
        statMarker.opacity = 0.25;
        distStatMarkers.push(statMarker);
        return [sampleStatMarkers, distStatMarkers];
    }else if(population.dimensions[1].categories.length == 2){
        // For 2 diminsional data with 2 groups, show the difference
        statisticOfInterest = state.prunedData.dimensions[0].type == 0 ? "Mean" : "Proportion";
        stats = [];
        for(var c in state.prunedData.dimensions[1].categories){
            category = state.prunedData.dimensions[1].categories[c];
            stat = population.statistics.grouped[category][statisticOfInterest];
            stats.push(stat);
            section = popSection.elements[c];
            statMarker = new visElement('line', 'popStatMarker'+c, ctx);
            section.addChild(statMarker);
            statMarker.setRelativeBoundingBox(popScale(stat) - section.boundingBox[0], 0, popScale(stat)- section.boundingBox[0], section.bbHeight, section.boundingBox);
            statMarker.drawSelf = drawLine.bind(statMarker, 'black', false);
            sampleStatMarkers.push(statMarker);
        }
        statMarker = new visElement('arrow', 'popStatMarker', ctx);
        popSection.addChild(statMarker);
        statMarker.setRelativeBoundingBox(popScale(stats[0]) - popSection.boundingBox[0], popSection.bbHeight/2, popScale(stats[1])- popSection.boundingBox[0], popSection.bbHeight/2, popSection.boundingBox);
        statMarker.drawSelf = drawArrow.bind(statMarker, 'black', 5);
        statMarker.setAlternateBB();
        sampleStatMarkers.push(statMarker);
        return [sampleStatMarkers, distStatMarkers];
    }else{
        // for 2 dimensional data with multiple groups, we want the
        // total variation from the mean.
        statisticOfInterest = state.prunedData.dimensions[0].type == 0 ? "Mean" : "Proportion";
        var overallStatistic = state.prunedData.statistics.overall[statisticOfInterest];
        stats = [];
        for(var cat in state.prunedData.dimensions[1].categories){
            category = state.prunedData.dimensions[1].categories[cat];
            stat = population.statistics.grouped[category][statisticOfInterest];
            stats.push(stat);
            section = popSection.elements[cat];
            statMarker = new visElement('line', 'popStatMarker'+cat, ctx);
            section.addChild(statMarker);
            statMarker.setRelativeBoundingBox(popScale(stat) - section.boundingBox[0], 0, popScale(stat)- section.boundingBox[0], section.bbHeight, section.boundingBox);
            statMarker.drawSelf = drawLine.bind(statMarker, 'black', false);
            sampleStatMarkers.push(statMarker);
            
            statMarker = new visElement('arrow', 'popStatArrow'+cat, ctx);
            section.addChild(statMarker);
            statMarker.setRelativeBoundingBox(popScale(stat) - section.boundingBox[0], section.bbHeight*(3/4), popScale(overallStatistic)- section.boundingBox[0], section.bbHeight*(3/4), section.boundingBox);
            statMarker.drawSelf = drawArrow.bind(statMarker, 'black', 5);
            statMarker.setAlternateBB();
            sampleStatMarkers.push(statMarker);
        }
        if(isPop){
            var popStatLine = new visElement('line', 'popStatMarker', ctx);
            popSection.addChild(popStatLine);
            popStatLine.setRelativeBoundingBox(popScale(overallStatistic) - popSection.boundingBox[0], 0, popScale(overallStatistic)- popSection.boundingBox[0], popSection.bbHeight*2 + popSection.parent.elements[0].bbHeight + popSection.parent.elements[2].bbHeight, popSection.boundingBox);
            popStatLine.drawSelf = drawLine.bind(popStatLine, 'black', true);
            sampleStatMarkers.push(statMarker);
            return [sampleStatMarkers, distStatMarkers];
        }else{
            var distSection = vis.dynamicSections.s3.elements[1];
            var distSectionBB = distSection.boundingBox;
            var arrowsHeight = distSection.bbHeight/3;
            var end = [distSectionBB[0] + distSection.bbWidth/2, distSectionBB[1],distSectionBB[0] + distSection.bbWidth/2, distSection[1] + arrowsHeight];
            statMarker = new visElement('arrow', 'popStatArrow'+cat, ctx);
            section.addChild(statMarker);
            statMarker.setRelativeBoundingBox(vis.distScale(0) - section.boundingBox[0], vis.dynamicSections.s3.elements[1].bbHeight/2, vis.distScale(population.statistics.overall.AvgDeviation)- section.boundingBox[0], vis.dynamicSections.s3.elements[1].bbHeight/2, distSectionBB);
            statMarker.setCenter(end[0], statMarker.centerY);
            statMarker.drawSelf = drawArrow.bind(statMarker, 'black', 5);
            statMarker.setAlternateBB();
            sampleStatMarkers.push(statMarker);
        }
        return [sampleStatMarkers, distStatMarkers];
    }
}

function setupDistribution(distribution, ctx, distSectionDisplayArea, distScale){
    var dynamicElements = [];
    var sectionElement = new visElement('rect', 'distribution', ctx);
    distSectionDisplayArea.addChild(sectionElement);
    sectionElement.setRelativeBoundingBox(0,0,distSectionDisplayArea.bbWidth, distSectionDisplayArea.bbHeight, distSectionDisplayArea.boundingBox);
    var datapoints = [];
    for(var d in distribution){
        var datapoint = distribution[d];
        var dataElement = new visElement('rect', 'distElem' + d, ctx);
        sectionElement.addChild(dataElement);
        dataElement.setBoundingBox(0,0,5,5);
        dataElement.setRelativeCenter(distScale(datapoint) - distScale(distScale.domain()[0]),sectionElement.bbHeight, sectionElement.boundingBox);
        dataElement.drawSelf = drawDataPoint.bind(dataElement);
        dataElement.fill = false;
        dataElement.hide();
        datapoints.push(dataElement);
    }
    if(datapoints.length > 1) {
        numericalHeap(datapoints, sectionElement.boundingBox, true);
        dynamicElements = datapoints;
    }
    return dynamicElements;
}
function setupDistStatMarkers(d, ctx, distSectionDisplayArea, sampleSectionDisplayArea, sampleScale){
    var dynamicElements = [];
    var distribution = [];
    distribution = distribution.concat(d);
    var sectionElement = new visElement('rect', 'distribution', ctx);
    distSectionDisplayArea.addChild(sectionElement);
    sectionElement.setRelativeBoundingBox(0,0,distSectionDisplayArea.bbWidth, distSectionDisplayArea.bbHeight, sampleSectionDisplayArea.boundingBox);
    var datapoints = [];
    for(var d in distribution){
        var datapoint = distribution[d];

        dataElement = new visElement('line', 'popStatMarker', ctx);
        sectionElement.addChild(dataElement);
        dataElement.setRelativeBoundingBox(sampleScale(datapoint) - sectionElement.boundingBox[0], 0, sampleScale(datapoint)- sectionElement.boundingBox[0], sampleSectionDisplayArea.boundingBox[3], sampleSectionDisplayArea.boundingBox);
        dataElement.drawSelf = drawLine.bind(dataElement, 'black', false);
        dataElement.setAlternateBB();
        datapoints.push(dataElement);
    }
    return datapoints;
}