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
        })
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
        var visHeight = $('#visualisation' ).innerHeight();
        var visWidth = $('#visualisation' ).innerWidth();

        $('#visualisation').html(`<canvas id="popCanvas" class="mainCanvas" width=${visWidth} height=${visHeight} data-normWidth = ${visWidth} data-normHeight = ${visHeight}></canvas>
            <canvas id="dynamicCanvas" class="mainCanvas" width=${visWidth} height=${visHeight} data-normWidth = ${visWidth} data-normHeight = ${visHeight}></canvas>
            `);
        this.toggleDataDisplay();
        this.toggleDataDisplay();

        $('#sampleButton').show();
    }

    toggleDataDisplay(){
        $('.mainCanvas').attr('width', 0);
        $('.mainCanvas').attr('height', 0);
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

        $('.mainCanvas').attr('width', $('#visualisation' ).innerWidth() - 2);
        $('.mainCanvas').attr('height', $('#visualisation' ).innerHeight() - 2);
        var newWidth = $('.mainCanvas').attr('width');
        var normWidth = $('.mainCanvas').attr('data-normWidth');
        var scaleX = newWidth/normWidth;

        if(Math.abs(scaleX - 1) > 0.01) {
            canvasRedraw(scaleX)
        }else{
            canvasRedraw(1);
        }

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
        var sampleOptions = $('#sampleOptions');
        if(!sampleOptions.length){
            var sampleOptionsHTML = generateSampleOptionsHTML(state.selectedModule.name, 0, false);
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
    }

    sampleSizeValid(){
        $('#sampleSizePanel').removeClass('has-error');
        $('#sampleSizePanel .glyphicon').removeClass('glyphicon-warning-sign');
        $('#sampleSizePanel').addClass('has-success');
        $('#sampleSizePanel .glyphicon').addClass('glyphicon-ok');
        
    }

    setupStatistic(){
        var avaliableStatistics = getStatisticsOptions();
        var selectedStat = state.statistic ? state.statistic : "";
        for(var c in avaliableStatistics){
            $('#statisticPanel .panel-body').append(`<option class="list-group-item" ${selectedStat == avaliableStatistics[c] ? "selected='selected'" : ""}>${avaliableStatistics[c]}</option>`);
        }
    }

    visualisationViewSwitch(){
        $('#fileOptions').hide();
        $('#sampleOptions').hide();
        var visualisationView = $('#visualisationView');
        if(!visualisationView.length){
            var visualisationViewHTML = generatevisualisationViewHTML();
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
        $('#sampleNum').append(`<th class="sampleTableValue" colspan=${state.prunedData.dimensions.length}>Sample ${state.selectedSample + 1}</th>`);
        for(var c in state.prunedData.dimensions){

            $('#tableHeadings').append(`<th class="sampleTableValue">${state.prunedData.dimensions[c].name}</th>`);
        }
        $('#prunedTable tbody tr').each(function(index){
            var tr = $(this);
            for(var c in state.prunedData.dimensions){

                var td = $(`<td class="sampleTableValue">${state.samples[state.selectedSample].sampleDataPoints[index].dimensionValues[c]}</td>`);
                tr.append(td);
                if(state.prunedData.dimensions[c].type == 1){
                    var colorIndex = state.prunedData.dimensions[c].categories.indexOf(state.samples[state.selectedSample].sampleDataPoints[index].dimensionValues[c]);
                    td.css("color", c == 0 ? proportionColorsList[colorIndex] : groupColorsList[colorIndex]);
                }
                tr.append(td);
            }
        });
        this.toggleDataDisplay();
        this.toggleDataDisplay();
    }

}

