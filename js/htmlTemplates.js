var homeHTML = `
            <div id="homeContent">
                <div id="contentContainer">
                    <div class="menutitle"><p class="menutitle t2">V</p><p class ="menutitle t1">I</p><p class ="menutitle t2">T Online</p> </div>
                    <div id = "discription">
                        <p> The capabilities of iNZightVIT's  Visual inference Tools (VIT) modules are being reworked in JavaScript by Ben Halsted for online use.  Try in Chrome, Firefox or Safari (not IE). <br>
                        <i>This short video gives some idea of how it works <a href="https://www.stat.auckland.ac.nz/~wild/VITonline/VIT_bootstrap1.mp4 ">VIT_bootstrap1.mp4)</a></i></p>
                    </div>

                    <div id = buttonContainer>
                        <button class="btn btn-primary btn-block" onclick="loadModule('Sampling Variation')">Sampling Variation</button>
                        <button class="btn btn-primary btn-block" onclick="loadModule('Bootstrapping')">Bootstrapping</button>
                        <button class="btn btn-primary btn-block" onclick="loadModule('Randomisation Variation')">Randomisation Variation</button>
                        <button class="btn btn-primary btn-block" onclick="loadModule('Randomisation Test')">Randomisation Test</button>
                    </div>
                </div>
            </div>
            `;
function generateFileOptionsHTML(module, exampleFiles){
 return `
      <div id="fileOptions">
          <button type="button" class="btn btn-default" aria-label="Back" onclick="loadModule('Home')">
              <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
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
                      <div class="col-md-6">
                          <label class = "btn btn-primary local-file-button"> Browse...
                              <input id = "localFile" type = "file" value = "Pick a local file" onchange = "localFile()">
                          </label>
                      </div>
                      <div class="col-md-6">
                          <div class="btn-group">
                              <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  Use an Example file... <span class="caret"></span>
                                </button>
                                <ul id= "presetDropdown" class="dropdown-menu">
                                  ${exampleFiles}
                                </ul>
                          </div>
                      </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <p class="pull-left" id="selectedFile"></p>
                  <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                  <button type="button" id="fileSelectDone" class="btn btn-primary" disabled="disabled" onclick="selectedFileClicked()" >Done</button>
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
          <button id = "sampleButton" class = "btn btn-primary btn-block" onclick="sampleButtonClicked()">Sample</button>
      </div>`;
  }

function generateSampleOptionsHTML(module, type, sampleSizeFixed){
  var sampleSizeRange = [1, getSampleSizeMax()];
  return `
  <div id="sampleOptions">
    <button type="button" class="btn btn-default" aria-label="Back" onclick="fileOptionsSwitch()">
      <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
    </button>
    <div id = "moduleName" class = "text-center h1">${module}</div>

    <div id="sampleSizePanel" class="panel panel-default has-feedback">
      <div id="sampleSizeHeader" class="panel-heading">
        <label class="control-label panel-title" for="sampleSizeInput">Sample Size</label>
      </div>
      <input id="sampleSizeInput" type="number" class="form-control" min=${sampleSizeRange[0]} max=${sampleSizeRange[1]} onchange="validateSampleSize()">
      <span class="glyphicon form-control-feedback" aria-hidden="true"></span>
    </div>

    <div id="statisticPanel" class="panel panel-default">
      <div id="statisticSelectHeader" class="panel-heading">
        <h3 class="panel-title">Statistic</h3>
      </div>
      <select id="statisticSelect" class="panel-body selectpicker">
      </select>
    </div>

    <button id = "takeSamplesButton" class = "btn btn-primary btn-block" onclick="takeSamplesButtonClicked()">Take Samples</button>
  </div>
  `;
}
function generateHomeHTML(){
    return homeHTML;
}
function fillPresets(filenames){
    if(filenames != "error"){
        var dropdown = $('#presetDropdown');
        dropdown.html("");
        for (var filename in filenames){
            dropdown.append(`<li class="list-group-item exampleItems">${filenames[filename]}</li>`);
        }
    }
}
function generateModuleHTML(module){
    var exampleFiles = `
    <li class="alert alert-danger">Can't retrieve files from server</li>
    `;
    getPresets(fillPresets)
    var moduleHTML = `
    <div id = "controls" class = "col-sm-3">
      ${generateFileOptionsHTML(module, exampleFiles)}
    </div>
    <div id = "display" class = "col-sm-9">
        <div id="dataDisplay" class="well">
        </div>
        <div id="visualisation">
        </div>
    </div>
    `;
    return moduleHTML;
}

function generatevisualisationViewHTML(){
  return `
  <div id="visualisationView">
    <div id="takeSamplesProgressContainer" class="progress">
      <div id="takeSamplesProgress" class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
        <span class="sr-only">0% Complete</span>
      </div>
    </div>
    <div id="visControls">
      <div id="buttonBar">
        <button type="button" class="btn btn-default" aria-label="Back" onclick="sampleOptionsSwitch()">
          <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
        </button>
        <button id="pausePlay" type="button" class="btn btn-default" aria-label="Back" onclick="pauseToggle()">
          <span class="glyphicon glyphicon-pause" aria-hidden="true"></span>
        </button>
        <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(5, false)">
          <span class="glyphicon glyphicon-play" aria-hidden="true"></span>
        </button>
        <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(5, true)">
          <span class="glyphicon glyphicon-play" aria-hidden="true"></span>
        </button>
        <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(900, true)">
          <span class="glyphicon glyphicon-play" aria-hidden="true"></span>
        </button>
      </div>
      <input id="visAnimProgress" type="range" min="0" list="stages">
      <datalist id="stages"></datalist>
    </div>
  </div>
  `;
}