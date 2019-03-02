const use_var_dropdown = true;
function generateFileOptionsHTML(module){
    return `
          <div id="fileOptions">
              <button type="button" class="bluebutton btn btn-default" aria-label="Back" onclick="fc_gotoHome('Home')">
                  <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                  Back to Main Menu
              </button>
              <div id = "moduleName" class = "text-center h1">${module}</div>
              <button id = "selectFileButton" class = "btn btn-primary btn-block" data-toggle="modal" data-target="#fileSelectModal">Select File</button>
    
              <div class="modal fade" id="fileSelectModal" tabindex="-1" role="dialog" aria-labelledby="fileSelectModalLabel">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                      <h4 class="modal-title" id="fileSelectModalLabel">Select a file</h4>
                    </div>
                    <div class="modal-body">
                      <div class ="row">
                          <div class="col-md-8">
                              <label class = "btn btn-primary local-file-button"> Choose a local file...
                                  <input id = "localFile" type = "file" value = "Pick a local file" onchange = "fc_localFile()">
                              </label>
                          </div>
    
                      </div>
                      <div class="row">
                        <div class="col-md-8">
                          <p> Or </p>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-8">
                          <div class="btn-group">
                              <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  Use an Example file... <span class="caret"></span>
                                </button>
                                <ul id= "presetDropdown" class="dropdown-menu">
                                </ul>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-8">
                          <p> Or </p>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-8">
                          <div class="input-group">
                            <input id="urlInputField" type="text" class="form-control" placeholder="From URL...">
                            <span class="input-group-btn">
                              <button class="btn btn-secondary" type="button" onclick="fc_loadFromURL()">Go!</button>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <p class="pull-left" id="selectedFile"></p>
                      <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                      <button type="button" id="fileSelectDone" class="btn btn-primary" disabled="disabled" onclick="fc_selectedFileClicked()" >Done</button>
                    </div>
                  </div>
                </div>
              </div>
    
              <div id = "selectedFileLabel" class = "well invisible"></div>
              <div id="variablePanel" class="panel panel-default invisible">
                <div id="variableSelectHeader" class="panel-heading">
                  <h3 class="panel-title">Variables</h3>
                </div>
                <select id="variableSelect" class="panel-body selectpicker" multiple='multiple'>
                </select>
              </div>
    
              <div id="focusPanel" class="panel panel-default invisible">
                <div id="focusSelectHeader" class="panel-heading">
                  <h3 class="panel-title">Category to focus on</h3>
                </div>
                <select id="focusSelect" class="panel-body selectpicker">
                </select>
              </div>
              <button id = "sampleButton" class = "btn btn-primary btn-block" onclick="fc_sampleButtonClicked()">Analyse</button>
          </div>`;
}

function generateFileOptionsHTML_old(module){
return `
        <div id="fileOptions">
            <button type="button" class="bluebutton btn btn-default" aria-label="Back" onclick="fc_gotoHome('Home')">
                <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                Back to Main Menu
            </button>
            <div id = "moduleName" class = "text-center h1">${module}</div>
            <div id = "selectFileButton" class = "text-center h4" data-toggle="modal" data-target="#fileSelectModal">Select File</div>
            <label class = "btn btn-primary btn-block local-file-button"> Choose a local file...
                <input id = "localFile" type = "file" value = "Pick a local file" onchange = "fc_localFile()">
            </label>
            <div class="input-group btn-block">
            <input id="urlInputField" type="text" class="form-control" placeholder="From URL...">
            <span class="input-group-btn">
                <button class="btn btn-secondary" type="button" onclick="fc_loadFromURL()">Go!</button>
            </span>
            </div>
            <div class="btn-group btn-block">
                <button type="button" class="btn btn-primary dropdown-toggle btn-block" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Use an Example file... <span class="caret"></span>
                </button>
                <ul id= "presetDropdown" class="dropdown-menu">
                </ul>
            </div>


            <div id = "selectedFileLabel" class = "well invisible"></div>
            <div id="variablePanel" class="panel panel-default invisible">
            <div id="variableSelectHeader" class="panel-heading">
                <h3 class="panel-title">Variables</h3>
            </div>
            <select id="variableSelect" class="panel-body selectpicker varselect" ${use_var_dropdown ? "" : "multiple='multiple'"}>
            </select>
            ${!use_var_dropdown ? "" : `<select id="variableSelect2" class="panel-body selectpicker varselect" ${use_var_dropdown ? "" : "multiple='multiple'"}>
            </select>`}
            </div>
            <div id="var-error" class="alert alert-danger" style="display:none;">
                <strong>Success!</strong> You should <a href="#" class="alert-link">read this message</a>.
            </div>

          
            <div id="focusPanel" class="panel panel-default invisible">
            <div id="focusSelectHeader" class="panel-heading">
                <h3 class="panel-title">Category to focus on</h3>
            </div>
            <select id="focusSelect" class="panel-body selectpicker">
            </select>
            </div>
            <button id = "sampleButton" class = "btn btn-primary btn-block" onclick="fc_sampleButtonClicked()">Analyse</button>
        </div>`;
}

function generateFileControls(old, module_name){

    // Returns the html for the controls, and functions to populate fields.
    let generator = old ? generateFileOptionsHTML_old : generateFileOptionsHTML;
    return [generator(module_name), [populateExampleFiles]];
}

function generateExampleFilesHTML(example_files){
    let html = ``;
    for (let f in example_files){
        let filename = example_files[f];
        html += `<li class="list-group-item exampleItems">${filename}</li>`;
    }
    return html;
}

function generateColumnsHTML(columns, selected, selected_index = 0){
    let html = ``;
    html += (`<option class="list-group-item" value="None">None</option>`);
    for(var c in columns){
        let letter = columns[c][1].slice(0, 1);
        let is_selected = $.inArray(columns[c][0], selected.slice(selected_index)) != -1;
        if(use_var_dropdown){
            is_selected = columns[c][0] == selected[selected_index];
        }
        html += (`<option class="list-group-item" value="${columns[c][0]}" ${ is_selected ? "selected" : ""}>${columns[c][0]} (${letter})</option>`);
    }
    return html;
}

function generateFocusHTML(factors, focus){
    let html = ``;
    for(var f in factors){
        html += (`<option class="list-group-item" ${focus == factors[f] ? "selected='selected'" : ""}>${factors[f]}</option>`);
    }
    return html;
}

// ********** File Control Events **********
function fc_gotoHome(module_name){
    controller.gotoHome(module_name);
}

function fc_localFile(){
    let file = $('#localFile')[0].files[0];
    if(file){
        controller.localFileSelected(file);
    }
}

function fc_loadFromURL(){
    let url = $("#urlInputField").val();
    if(url){
        controller.urlFileSelected(url);
    }
}

$(document).on('click', '.exampleItems', function(){
    var data = this.innerText;
    controller.exampleFileSelected(data);
});

$(document).on('change', '.varselect', function(e){
    $('.varAlert').remove();
    //$('#focusPanel').addClass('invisible');
    $('#focusPanel').hide();
    controller.columnSelected(e);
});

$(document).on('change', '#focusSelect', function(e){
    controller.focusSelected(e);
});

function fc_selectedFileClicked(){
    return ;
}

function fc_sampleButtonClicked(){
    controller.gotoOption();
}

// ********** File Control Updates **********
async function populateExampleFiles(){
    let example_files = await model.getExampleFileNames();
    let example_files_html = generateExampleFilesHTML(example_files);
    $("#presetDropdown").html(example_files_html);
    $('#var-error').hide();
}

function fc_populateColumnSelect(columns, selected){
    $('#variablePanel').removeClass('invisible');
    //$('#variablePanel').show();
    if(! use_var_dropdown){
        $('#variablePanel #variableSelect').attr('size', Math.min(columns.length, 10));
    }
    
    let columns_html = generateColumnsHTML(columns, selected);
    $('#variablePanel #variableSelect').html(columns_html);
    if(use_var_dropdown){
        let columns_html = generateColumnsHTML(columns, selected, 1);
        $('#variablePanel #variableSelect2').html(columns_html);
    }

}

function fc_populateFocus(factors, focus){
    $('#focusPanel').removeClass('invisible');
    $('#focusPanel').show();
    let focus_html = generateFocusHTML(factors, focus);
    $('#focusPanel .panel-body').html(focus_html);
}

function fc_showContinue(){

}
function fc_urlError(err){
    alert(err);
}

function fc_exampleError(err){
    alert(err);
}

function fc_formatError(err){
    alert("File is in the wrong format");
}

function fc_tooManyVariables(err){
    $('#var-error').text("Too many columns selected");
    $('#var-error').show();
}
function fc_notEnoughVariables(err){
    $('#var-error').text("Select a primary variable");
    $('#var-error').show();
}

function fc_wrongModule(err){
    $('#var-error').text("Wrong column types for module");
    $('#var-error').show();
}

function fc_showContinue(){
    $('#sampleButton').show();
}

function fc_clear_var_error(){
    $('#var-error').hide();
}