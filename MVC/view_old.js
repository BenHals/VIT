class viewClass {
    constructor(){
        $(document).on('click', '.exampleItems', function(){
            var data = this.innerText;
            loadFromPreset(data);
        });

        $(document).on('change', '#variableSelect', function(e){
            $('.varAlert').remove();
            $('#focusPanel').addClass('invisible');
            varSelected(e, true);
        });

        $(document).on('change', '#focusSelect', function(e){
            focusSelected(e);
        });
        $(document).on('change', '#statisticSelect', function(e){
            statisticSelected(e);
        });
        $(document).keydown(function(e){
            console.log(e.which);
            if(e.which == 39){
                selectedSampleChange(1);
            }
            if(e.which == 37){
                selectedSampleChange(-1);
            }
        });
        $(document).on('input', '#visAnimProgress', function(e){
            visAnimUserInput(e);
        });
        $(document).on('change', '#visAnimProgress', function(e){
            visAnimUserRelease(e);
        });
        this.showingDataDisplay = true;
    }
    switchModule(moduleHTML){
        $('#moduleContent').html(moduleHTML);
        $('#sampleButton').hide();
    }

    selectedFileDone(fileName){
        $('#fileSelectModal').modal('hide');
        $('#selectedFileLabel').removeClass('invisible');
        $('#selectedFileLabel').text(fileName);

        $('#focusPanel').hide();
        $('#sampleButton').hide();

        $('#sampleOptions').remove();
    }

    setupVariableDisplay(variables, selected){
        $('#variablePanel').removeClass('invisible');
        $('#variablePanel .panel-body').attr('size', Math.min(variables.length, 10));
        $('#variablePanel .panel-body').html("");

        for(var v in variables){
            var letter = variables[v][1] == 0 ? 'n' : 'c';
            $('#variablePanel .panel-body').append(`<option class="list-group-item" value="${variables[v][0]}" ${$.inArray(variables[v][0] + " (" + letter +")", selected) != -1 ? "selected" : ""}>${variables[v][0]} (${variables[v][1] == 0 ? "n" : "c"})</option>`);
        }
    }

    tooManyVariables(){
        $('#variablePanel').append(`<div id="tooManyVariables" class="alert alert-danger pull-right varAlert">Too many variables selected</div>`);
    }
    numericalSecondDim(){
        $('#variablePanel').append(`<div id="numericalSecondDim" class="alert alert-danger pull-right varAlert">Second variable must be categorical (c)</div>`);
    }
    wrongModule(){
        $('#variablePanel').append(`<div id="wrongModule" class="alert alert-danger pull-right varAlert">Selected variables not allowed for this module</div>`);     
    }

    setupFocus(categories, focus){
        $('#focusPanel').removeClass('invisible');
        $('#focusPanel').show();
        $('#focusPanel .panel-body').html("");

        for(var c in categories){
            $('#focusPanel .panel-body').append(`<option class="list-group-item" ${focus == categories[c] ? "selected='selected'" : ""}>${categories[c]}</option>`);
        }
    }

    setupPopulation(prunedData){
        if(!this.showingDataDisplay) this.toggleDataDisplay();
        $('#dataDisplay').html(`
            <button type="button" class="btn btn-default hidden" aria-label="hide" onclick="toggleDataDisplay()">
                <span id="hideDD" class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>
                <span id="showDD" class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>
            </button>
            <div class="table-responsive">
                <table id='prunedTable' class = 'table'><thead><tr id='sampleNum'></tr><tr id='tableHeadings'></tr></thead><tbody></tbody></table>
            </div>`);
        $('#sampleNum').append(`<th colspan=${prunedData.dimensions.length}>Population</th>`);
        for(var c in prunedData.dimensions){
            $('#tableHeadings').append(`<th>${prunedData.dimensions[c].name}</th>`);
        }

        for(var r in prunedData.allDataPoints){
            if(+r > 19) break;
            var row = prunedData.allDataPoints[r];
            var tr = $("<tr></tr>");
            tr.attr('data-id', r);
            $('#prunedTable tbody').append(tr);
            for(var c in prunedData.dimensions){
                var td = $(`<td>${row.dimensionValues[c]}</td>`);
                tr.append(td);
                if(prunedData.dimensions[c].type == 1){
                    var colorIndex = prunedData.dimensions[c].categories.indexOf(row.dimensionValues[c]);
                    td.css("color", c == 0 ? proportionColorsList[colorIndex] : groupColorsList[colorIndex]);
                }
                
            }

        }
        
        $('#dataDisplay button').removeClass('hidden');
        $('#showDD').toggle();

        $('#dataDisplay').append("<div id='popStats' class='panel panel-default'><div class='panel-heading'><p style='font-weight:bold'>Statistics</p></div></div>")
        for(var s in prunedData.statistics.overall){
            var stat = prunedData.statistics.overall[s]
            if(!isNaN(+stat)) stat = Math.round(+stat * 100)/100;
            $('#popStats').append(`<p class='list-group-item'>${s} : ${stat}</p>`);
        }
        var width =$('#prunedTable' ).width();
        // $('#popStats').width('auto');
        
        // var sWidth =$('#popStats').width();
        // var width = Math.max(tWidth, sWidth);
        // $('#tWrapper').width(width);
        $('#dataDisplay').innerWidth(width);
        // $('#popStats').width(width);
        // $('#dataDisplay button').width(width);
        this.toggleDataDisplay();
         $('#visualisation').html(`<div id="canvasWrapper"></div>`);
        var visHeight = $('#visualisation' ).innerHeight();
        var visWidth = $('#visualisation' ).innerWidth();

        $('#visualisation').html(`<div id="canvasWrapper">
            <canvas id="popCanvas" class="mainCanvas" width=${visWidth} height=${visHeight} data-normWidth = ${visWidth} data-normHeight = ${visHeight}></canvas>
            <canvas id="dynamicCanvas" class="mainCanvas" width=${visWidth} height=${visHeight} data-normWidth = ${visWidth} data-normHeight = ${visHeight}></canvas>
            <svg id="dynamicSVG" class="mainCanvas" width=${visWidth} height=${visHeight} data-normWidth = ${visWidth} data-normHeight = ${visHeight}><g id="svgContainer"></g></svg>
            </div>`);

        this.toggleDataDisplay();
        this.toggleDataDisplay();
        var dispWidth = $('#dataDisplay').css("width");
        //$('#dynamicCanvas').css("left", parseInt(dispWidth.slice(0, dispWidth.length-2)) + 5);
        $('#sampleButton').show();
    }

    toggleDataDisplay(){
        $('.mainCanvas').attr('width', 0);
        $('.mainCanvas').attr('height', 0);
        $('#canvasWrapper').css('width', 0);
        // $('#visualisation').toggle();
        $('#visualisation').css('width', 0);
        $('#popStats').toggle();
        $('#prunedTable').toggle();
        $('#showDD').toggle();
        $('#hideDD').toggle();
        var width =$('#prunedTable' ).width();
        if(this.showingDataDisplay){
            $('#dataDisplay').innerWidth('50');
        }else{
            $('#dataDisplay').innerWidth('auto');
            $('#dataDisplay .table-responsive').innerWidth(Math.max(width, $('#popStats').width()));
        }
        $('#canvasWrapper').css('width', 0);
        //$('#visualisation').toggle();
        $('#visualisation').css('width', 'auto');
        var width =  $('#visualisation' ).width() - 2;
        $('.mainCanvas').attr('width', width);
        $('.mainCanvas').attr('height', $('#visualisation' ).height() - 2);
        $('#canvasWrapper').width(width);
        var newWidth = $('.mainCanvas').attr('width');
        var normWidth = $('.mainCanvas').attr('data-normWidth');
        var scaleX = newWidth/normWidth;

        if(Math.abs(scaleX - 1) > 0.01) {
            canvasRedraw(scaleX)
        }else{
            canvasRedraw(1);
        }
        // $('#dynamicCanvas').css("left", 1000);
        // var dispWidth = $('#dataDisplay').width();
        // $('#dynamicCanvas').css("left", dispWidth + 5);
        // var dispWidth = $('#dataDisplay').outerWidth();
        // $('#dynamicCanvas').css("left", dispWidth + 5);
        this.showingDataDisplay = !this.showingDataDisplay;
    }

    fileOptionsSwitch(){
        $('#fileOptions').show();
        $('#sampleOptions').hide();
        $('#visualisationView').hide();
    }

    sampleOptionsSwitch(){
        $('#fileOptions').hide();
        $('#visualisationView').hide();
        $('#controls').detach().insertBefore("#display");
        $("#controls").removeClass("col-sm-pull-9");
        $("#display").removeClass("col-sm-push-3");
        var sampleOptions = $('#sampleOptions');
        if(!sampleOptions.length){
            var sampleOptionsHTML = state.design.genSampleOptions(state.selectedModule.name, 0, false);
            $('#controls').append(sampleOptionsHTML);
            $('#sampleSizeInput').val(getSampleSizeDefault()).change();
        }else{
            $('#sampleOptions').show();
        }
        this.setupStatistic();
    }

    sampleSizeAlert(text){
        $('#sampleSizePanel').append(`<div id="sampleSizeAlert" class="alert alert-danger pull-right varAlert">${text}</div>`);
        $('#sampleSizePanel').removeClass('has-success');
        $('#sampleSizePanel .glyphicon').removeClass('glyphicon-ok');
        $('#sampleSizePanel').addClass('has-error');
        $('#sampleSizePanel .glyphicon').addClass('glyphicon-warning-sign');
        $('#takeSamplesButton').hide();
    }

    sampleSizeValid(){
        $('#sampleSizePanel').removeClass('has-error');
        $('#sampleSizePanel .glyphicon').removeClass('glyphicon-warning-sign');
        $('#sampleSizePanel').addClass('has-success');
        $('#sampleSizePanel .glyphicon').addClass('glyphicon-ok');
        $('#takeSamplesButton').show();
        
    }
    groupNumAlert(text){
        $('#groupNumPanel').append(`<div id="groupNumAlert" class="alert alert-danger pull-right varAlert">${text}</div>`);
        $('#groupNumPanel').removeClass('has-success');
        $('#groupNumPanel .glyphicon').removeClass('glyphicon-ok');
        $('#groupNumPanel').addClass('has-error');
        $('#groupNumPanel .glyphicon').addClass('glyphicon-warning-sign');
        $('#takeSamplesButton').hide();
    }

    groupNumValid(){
        $('#groupNumPanel').removeClass('has-error');
        $('#groupNumPanel .glyphicon').removeClass('glyphicon-warning-sign');
        $('#groupNumPanel').addClass('has-success');
        $('#groupNumPanel .glyphicon').addClass('glyphicon-ok');
        $('#takeSamplesButton').show();
        
    }
    setupStatistic(){
        var avaliableStatistics = getStatisticsOptions();
        var selectedStat = state.statistic ? state.statistic : "";
        $('#statisticPanel .panel-body option').remove();
        for(var c in avaliableStatistics){
            $('#statisticPanel .panel-body').append(`<option class="list-group-item" ${selectedStat == avaliableStatistics[c] ? "selected='selected'" : ""}>${avaliableStatistics[c]}</option>`);
        }
    }

    visualisationViewSwitch(){
        $('#fileOptions').hide();
        $('#sampleOptions').hide();
        var visualisationView = $('#visualisationView');
        $('#controls').detach().insertAfter("#display");
        $("#controls").addClass("col-sm-pull-9");
        $("#display").addClass("col-sm-push-3");
        if(!visualisationView.length){
            var visualisationViewHTML = state.design.genVisualisationView(state.selectedModule);
            $('#controls').append(visualisationViewHTML);
        }else{
            $('#visualisationView').show();
        }
        $('#visControls').hide();
        $('#takeSamplesProgressContainer').show();
        $('#takeSamplesProgress').css('width', "0%");
    }
    takeSamplesProgressUpdate(progress){

        var bar = $('#takeSamplesProgress');
        $('#takeSamplesProgressContainer').show();
        bar.css('width', progress+"%");
    }

    takeSamplesFin(){
        $('#takeSamplesProgressContainer').hide();
        $('#visControls').show();
        this.setupSampleTableValues();
    }
    setupSampleTableValues(){
        $('.sampleTableValue').remove();
        $('#sampleNum').append(`<th class="sampleTableValue" colspan=${state.sampleData.dimensions.length}>Sample ${state.selectedSample + 1}</th>`);
        for(var c in state.sampleData.dimensions){

            $('#tableHeadings').append(`<th class="sampleTableValue">${state.sampleData.dimensions[c].name}</th>`);
        }
        $('#prunedTable tbody tr').each(function(index){
            var tr = $(this);
            if(index >= state.sampleSize) return;
            for(var c in state.sampleData.dimensions){

                var td = $(`<td class="sampleTableValue">${state.sampleData.samples[state.selectedSample].allDataPoints[index].dimensionValues[c]}</td>`);
                tr.append(td);
                if(state.sampleData.dimensions[c].type == 1){
                    var colorIndex = state.sampleData.dimensions[c].categories.indexOf(state.sampleData.samples[state.selectedSample].allDataPoints[index].dimensionValues[c]);
                    td.css("color", c == 0 ? proportionColorsList[colorIndex] : groupColorsList[colorIndex]);
                }
                tr.append(td);
            }
        });
        this.toggleDataDisplay();
        this.toggleDataDisplay();
        var dispWidth = $('#dataDisplay').css("width");
       // $('#dynamicCanvas').css("left", parseInt(dispWidth.slice(0, dispWidth.length-2)) + 5);
    }
    toPause(){
        $('#pausePlay span').removeClass('glyphicon-play');
        $('#pausePlay span').addClass('glyphicon-pause');
    }
    toUnPause(){
        $('#pausePlay span').removeClass('glyphicon-pause');
        $('#pausePlay span').addClass('glyphicon-play');
    }
    visAnimDraggableInit(animation){
        state.animDraggableMap = {};
        var datalist = $('#stages');
        datalist.html("");
        var sum = 0;
        for(var s in animation.stages){
            var duration = animation.stages[s].duration;
            var range = [sum, sum + duration];
            datalist.append(`<option value=${sum}>`);
            state.animDraggableMap[s] = {range:range, width:duration};
            sum += duration;
        }
        var bar = $('#visAnimProgress');
        
        bar.attr("max", sum);
    }
    visAnimDraggableProgress(animation, stageProgress){
        var bar = $('#visAnimProgress');
        var stage = animation.getStage();
        if(stage){
            var timeFromStageStart = (stageProgress == 1 ? 0 : stageProgress) * stage.duration;
            var stageStart = state.animDraggableMap[animation.currentStage].range[0];
            bar.val(stageStart+timeFromStageStart);
            bar.css('-webkit-slider-runnable-track ', 'background:linear-gradient(to right, #3f51b5 0%, #3f51b5 50%, #515151 100%)');
        }
    }


}

