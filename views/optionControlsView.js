function generateOptionControlsHTML(module){
    return `
    <div id="sampleOptions">
      <button type="button" class="btn btn-default" aria-label="Back" onclick="oc_back()">
        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
      </button>
      <div id = "moduleName" class = "text-center h1">${module}</div>
        <div id="options">
        </div>
      <button id = "takeSamplesButton" class = "btn btn-primary btn-block" onclick="takeSamplesButtonClicked()">Take Samples</button>
    </div>
    `;
}

function generateoptionControlsHTML_old(module){
    return `
    <div id="sampleOptions">
      <button type="button" class="btn btn-default" aria-label="Back" onclick="oc_back()">
        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
      </button>
      <div id = "moduleName" class = "text-center h1">${module}</div>
      <div id="options">
      </div>
      <button id = "takeSamplesButton" class = "btn btn-primary btn-block" onclick="oc_takeSamplesButtonClicked()">Take Samples</button>
    </div>
    `;
}

function genOption(name, option, value){
    let id = `${name.replace(/\s+/g, '')}Option`;
    let input = ``;
    if(option.type == 'number'){
        let min = option.range[0];
        if(min == 'max') min = model.getPopulationSize();
        let max = option.range[1];
        if(max == 'max') max = model.getPopulationSize();
        input = `<input id="${id}Input" type="number" class="form-control" min=${min} max=${max} value = ${value}>`;
    }else if(option.type == 'category'){
        let values = option.values;
        input = `<select id="${id}Input" class="panel-body selectpicker btn-block">`;
        for(let v in values){
            let val = values[v];
            let selected = val == value;
            input += `<option class="list-group-item" ${selected ? "selected='selected'" : ""}>${val}</option>`;
        }
        input += '</select>'
    }
    return `    
    <div id="${id}Panel" class="panel panel-default has-feedback">
        <div id="${id}PanelHeader" class="panel-heading">
            <label class="control-label panel-title" for="${id}Input">${name}</label>
        </div>
        ${input}
        <span class="glyphicon form-control-feedback" aria-hidden="true"></span>
    </div>`;
}

function generateOptionControls(old, module_name){

    // Returns the html for the controls, and functions to populate fields.
    let generator = old ? generateoptionControlsHTML_old : generateOptionControlsHTML;
    return [generator(module_name), []];
}

// ********** Option Control Events **********
function oc_back(){
    controller.optionBack();
}

function oc_takeSamplesButtonClicked(){
    controller.takeSamples();
}

function oc_validateCat(name, e){
 console.log(e);
}

function oc_validateNumber(name, e){
    console.log(e);
}

// ********** Option Control Updates **********
function oc_populateOptions(required_options){
    for(let o = 0; o < required_options.length; o++){
        var option = required_options[o];
        if(option.hide_option) continue;
        let option_name = option.name;
        let current_value = model.getOptions()[option_name];
        let input = genOption(option_name, option, current_value);
        $("#options").append(input);
        let change_func = (o) => function(e){
            let new_val = $(this).val();
            let valid = o.validate(new_val, o);
            if(valid){
                controller.setOption(o, new_val);
                oc_valid(o, new_val);
            }else{
                oc_invalid(o, new_val);
            }
            
        };
        $(`#${option_name.replace(/\s+/g, '')}OptionInput`).on('change', change_func(option) );
        $(`#${option_name.replace(/\s+/g, '')}OptionInput`).val(current_value).trigger('change');
    }   
}

function oc_invalid(o, new_val){
    let id = `${o.name.replace(/\s+/g, '')}Option`;
    $(`#${id}Panel`).removeClass('has-success');
    $(`#${id}Panel .glyphicon`).removeClass('glyphicon-ok');
    $(`#${id}Panel`).addClass('has-error');
    $(`#${id}Panel .glyphicon`).addClass('glyphicon-warning-sign');
    o.is_valid = false;
}

function oc_valid(o, new_val){
    let id = `${o.name.replace(/\s+/g, '')}Option`;
    $(`#${id}Panel`).removeClass('has-error');
    $(`#${id}Panel .glyphicon`).removeClass('glyphicon-warning-sign');
    $(`#${id}Panel`).addClass('has-success');
    $(`#${id}Panel .glyphicon`).addClass('glyphicon-ok');
    o.is_valid = true;
}
function oc_refresh_option(name, option, value){
    let id = `${name.replace(/\s+/g, '')}Option`;
    let panel = $(`#${id}Panel`);
    let index = $("#options").children().index()
    panel.remove();
    if(index == 0){
        $(`#options`).prepend(genOption(name, option, value));
    }else{
        $(`#options>div:eq(${index-1})`).after(genOption(name, option, value));
    }
    

}
