let dd_showing = false;
function generateDataDisplay(dataset){
    let base_html = `
    <button type="button" class="btn btn-default hidden" aria-label="hide" onclick="dd_toggle()">
        <span id="hideDD" class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>
        <span id="showDD" class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>
    </button>
    <div class="table-responsive">
        <table id='prunedTable' class = 'table'>
            <thead>
                <tr id='sampleNum'></tr>
                <tr id='tableHeadings'></tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>`;
    return [base_html, [dd_populateInit.bind(this, dataset, model.dimensions), dd_populateStatistics.bind(this, dataset)]];
}

// ********** Data Display Events **********
function dd_toggle(){
    dd_showing ? dd_hide() : dd_show();
    controller.ddResized($("#dataDisplay").outerWidth());
}
// ********** Data Display Updates **********
function dd_populateInit(dataset, dimensions){
    $('#dataDisplay button').removeClass('hidden');
    $('#showDD').toggle();
    dd_showing = true;
    $('#sampleNum').append(`<th colspan=${dimensions.length}>Population</th>`);
    $('#sampleNum').append(`<th colspan=${dimensions.length}>Sample</th>`);
    for(let c in dimensions){
        $('#tableHeadings').append(`<th>${dimensions[c].name}</th>`);
    }
    for(let c in dimensions){
        $('#tableHeadings').append(`<th>${dimensions[c].name}</th>`);
    }
    dd_populateRows(dataset, dimensions);
    dd_updateDatapoints(dataset, dimensions, true);
    dd_updateDatapoints(dataset, dimensions, false);
    dd_toggle();
}

function dd_populateRows(dataset, dimensions){
    for(let r in dataset.all){
        if(+r > 19) break;
        let row = dataset.all[r];
        let tr = $("<tr></tr>");
        tr.attr('data-id', r);
        $('#prunedTable tbody').append(tr);
        for(var c in dimensions){
            // let dim_name = dimensions[c].name;
            // var td = $(`<td>${row[dim_name]}</td>`);
            // tr.append(td);
            // if(dimensions[c].type == 'categoric'){
            //     var colorIndex = dimensions[c].factors.indexOf(row[dim_name]);
            //     td.css("color", c == 0 ? config.proportionColorsList[colorIndex] : config.groupColorsList[colorIndex]);
            // }   
            let td = $(`<td></td>`);
            tr.append(td);
            // if(dimensions[c].type == 'categoric'){
            //     var colorIndex = dimensions[c].factors.indexOf(row[dim_name]);
            //     td.css("color", c == 0 ? config.proportionColorsList[colorIndex] : config.groupColorsList[colorIndex]);
            // } 
        }
        for(var c in dimensions){
            let td = $(`<td></td>`);
            tr.append(td);
        }
    }
}

function dd_updateDatapoints(dataset, dimensions, isPop){
    let rows = $("#prunedTable > tbody > tr");
    let start_td = isPop ? 0 : dimensions.length;
    let end_td = isPop ? dimensions.length : dimensions.length * 2;
    rows.each(function(r){
        let td_elements = $(this).children();
        td_elements.each(function(d){
            if(d < start_td || d >= end_td) return;
            let dim_index = d - start_td;
            let row_value = dataset.all[r][dimensions[dim_index].name];
            $(this).html(row_value);
            if(dimensions[dim_index].type == 'categoric'){
                let colorIndex = dimensions[dim_index].factors.indexOf(row_value);
                $(this).css("color", dim_index == 0 ? config.proportionColorsList[colorIndex] : config.groupColorsList[colorIndex]);
            } 
        })
    })
}

function dd_populateStatistics(dataset){
    // $('#dataDisplay').append("<div id='popStats' class='panel panel-default'><div class='panel-heading'><p style='font-weight:bold'>Statistics</p></div></div>")
    // for(var s in prunedData.statistics.overall){
    //     var stat = prunedData.statistics.overall[s]
    //     if(!isNaN(+stat)) stat = Math.round(+stat * 100)/100;
    //     $('#popStats').append(`<p class='list-group-item'>${s} : ${stat}</p>`);
    // }
}

function dd_show(){
    $("#prunedTable").show();
    $("#hideDD").show();
    $("#showDD").hide();
    dd_showing = true;
}

function dd_hide(){
    $("#prunedTable").hide();
    $("#hideDD").hide();
    $("#showDD").show();
    dd_showing = false;
}