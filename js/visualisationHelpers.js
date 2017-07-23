

function setupSection(dataset, ctx, displayArea){
    var proportionBar = new visElement('rect', 'population', ctx);
    var populationSections = [];

    // If there is no second dimension, all points are grouped.
    if(dataset.dimensions.length == 1){
        populationSections.push({data:dataset.allDataPoints, boundingBox:[0,0,displayArea.bbWidth, displayArea.bbHeight], statistics:dataset.statistics.overall, name:""});
    }else{
        var categories = dataset.dimensions[1].categories;
        var numCategories = categories.length;

        var sectionBoundingBox = displayArea.boundingBox; 
        var totalHeight = displayArea.bbHeight;

        var sectionHeight = totalHeight / numCategories;
        for(var cat = 0; cat < numCategories; cat++){
            var catagoryName = categories[cat];
            var bbox = [0, sectionHeight * cat, displayArea.bbWidth, sectionHeight * (cat + 1)];
            var data = dataset.allDataPoints.filter(function(d){return d.dimensionValues[1] == catagoryName});
            populationSections.push({data:data, boundingBox:bbox, statistics:dataset.statistics.grouped[catagoryName], name:catagoryName});
        }
    }
    return populationSections;
}

function setupProportional(dataset, ctx, displayArea, proportionScale, populationSections){

    for(var s in populationSections){
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
        focusBarLabel.setText(focusProportion > 0.001 ? dataset.focus : "");
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
    }
}

function setupNumerical(dataset, ctx, displayArea, numericalScale, populationSections){
    
    for(var s in populationSections){
        var section = populationSections[s];
        var sectionElement = new visElement('rect', 'populationSection' + s, ctx);
        displayArea.addChild(sectionElement);
        sectionElement.setRelativeBoundingBox(section.boundingBox[0],section.boundingBox[1],section.boundingBox[2],section.boundingBox[3], displayArea.boundingBox);
        for(var d in section.data){
            var datapoint = section.data[d];
            var dataElement = new visElement('rect', 'populationDP' + s, ctx);
            sectionElement.addChild(dataElement);
            dataElement.setBoundingBox(0,0,10,10);
            dataElement.setRelativeCenter(numericalScale(datapoint.dimensionValues[0]) - numericalScale(numericalScale.domain()[0]),sectionElement.bbHeight*(1/2), sectionElement.boundingBox);
            dataElement.drawSelf = dataElement.renderBB;
        }
        
        labelSection(sectionElement, ctx, section.name, s);
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