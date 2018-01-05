
generateDataDisplay(data){
    let base_html = `
    <button type="button" class="btn btn-default hidden" aria-label="hide" onclick="toggleDataDisplay()">
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
}

// ********** Data Display Events **********

// ********** Data Display Updates **********
function dd_populateDatapoints(dimensions, dataset){
    $('#sampleNum').append(`<th colspan=${dimensions.length}>Population</th>`);
    for(var c in dimensions){
        $('#tableHeadings').append(`<th>${dimensions[c].name}</th>`);
    }
    for(var r in dataset.all){
        if(+r > 19) break;
        var row = dataset.all[r];
        var tr = $("<tr></tr>");
        tr.attr('data-id', r);
        $('#prunedTable tbody').append(tr);
        for(var c in dimensions){
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
}

function dd_populateStatistics(statistics){
    $('#dataDisplay').append("<div id='popStats' class='panel panel-default'><div class='panel-heading'><p style='font-weight:bold'>Statistics</p></div></div>")
    for(var s in prunedData.statistics.overall){
        var stat = prunedData.statistics.overall[s]
        if(!isNaN(+stat)) stat = Math.round(+stat * 100)/100;
        $('#popStats').append(`<p class='list-group-item'>${s} : ${stat}</p>`);
    }
}