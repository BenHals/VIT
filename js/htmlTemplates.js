var new_design = {};
new_design.genFileOptions = generateFileOptionsHTML;
new_design.genSampleOptions = generateSampleOptionsHTML;
new_design.genHome = generateHomeHTML;
new_design.genModule = generateModuleHTML;
new_design.genVisualisationView = generatevisualisationViewHTML;

var old_design = {};
old_design.genFileOptions = generateFileOptionsHTML_old;
old_design.genSampleOptions = generateSampleOptionsHTML_old;
old_design.genHome = generateHomeHTML;
old_design.genModule = generateModuleHTML;
old_design.genVisualisationView = generatevisualisationViewHTML_old;

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
          <button type="button" class="bluebutton btn btn-default" aria-label="Back" onclick="loadModule('Home')">
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
                              <input id = "localFile" type = "file" value = "Pick a local file" onchange = "localFile()">
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
                              ${exampleFiles}
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
                          <button class="btn btn-secondary" type="button" onclick="loadFromURL()">Go!</button>
                        </span>
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
          <button id = "sampleButton" class = "btn btn-primary btn-block" onclick="sampleButtonClicked()">Analyse</button>
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
      ${state.design.genFileOptions(module, exampleFiles)}
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

function generatevisualisationViewHTML(module){
  if ($(window).width() < 768) {
    // do something for small screens
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
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(1, false)">
            <span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(5, false)">
            <span class="glyphicon glyphicon-forward" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(1, true)">
            <span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(5, true)">
            <span class="glyphicon glyphicon-forward" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(900, true)">
            <span class="glyphicon glyphicon-flash" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="showCI()">
            <span class="glyphicon glyphicon-stats" aria-hidden="true"></span>
          </button>
        </div>
        <input id="visAnimProgress" type="range" min="0" list="stages">
        <datalist id="stages"></datalist>
      </div>
    </div>
    `;
  }else{
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
            Back to Data Input
          </button>



          <div id="samplePlayButtons" class="playSection panel panel-default">
            <div class="panel-heading">${module.playSectionLabels[0]}</div>
            <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(1, false)">
              <span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span>
              <span>1</span>
            </button>
            <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(5, false)">
              <span class="glyphicon glyphicon-forward" aria-hidden="true"></span>
              <span>5</span>
            </button>
          </div>

          <div id="distPlayButtons" class="playSection panel panel-default">
            <div class="panel-heading">${module.playSectionLabels[1]}</div>
            <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(1, true)">
              <span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span>
              <span>1</span>
            </button>
            <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(5, true)">
              <span class="glyphicon glyphicon-forward" aria-hidden="true"></span>
              <span>5</span>
            </button>
            <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(900, true)">
              <span class="glyphicon glyphicon-flash" aria-hidden="true"></span>
              <span>1000</span>
            </button>
          </div>

          <div id="statsPlayButtons" class="playSection panel panel-default">
            <div class="panel-heading">${module.playSectionLabels[2]}</div>
            <button type="button" class="btn btn-default" aria-label="Back" onclick="showCI()">
              <span class="glyphicon glyphicon-stats" aria-hidden="true"></span>
            </button>
          </div>
        </div>

        <div id="animationPlayback" class="playSection panel panel-default">
          <div class="panel-heading">Playback Controls</div>
          <button id="pausePlay" type="button" class="btn btn-default" aria-label="Back" onclick="pauseToggle()">
              <span class="glyphicon glyphicon-pause" aria-hidden="true"></span>
            </button>
          <input id="visAnimProgress" type="range" min="0" list="stages">
          <datalist id="stages"></datalist>
        </div>
      </div>
    </div>
    `;
  }
}

function generateFileOptionsHTML_old(module, exampleFiles){
 return `
      <div id="fileOptions">
          <button type="button" class="bluebutton btn btn-default" aria-label="Back" onclick="loadModule('Home')">
              <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
              Back to Main Menu
          </button>
          <div id = "moduleName" class = "text-center h1">${module}</div>
          <div id = "selectFileButton" class = "text-center h4" data-toggle="modal" data-target="#fileSelectModal">Select File</div>
          <label class = "btn btn-primary btn-block local-file-button"> Choose a local file...
              <input id = "localFile" type = "file" value = "Pick a local file" onchange = "localFile()">
          </label>
          <div class="input-group btn-block">
            <input id="urlInputField" type="text" class="form-control" placeholder="From URL...">
            <span class="input-group-btn">
              <button class="btn btn-secondary" type="button" onclick="loadFromURL()">Go!</button>
            </span>
          </div>
          <div class="btn-group btn-block">
              <button type="button" class="btn btn-primary dropdown-toggle btn-block" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Use an Example file... <span class="caret"></span>
                </button>
                <ul id= "presetDropdown" class="dropdown-menu">
                  ${exampleFiles}
                </ul>
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
          <button id = "sampleButton" class = "btn btn-primary btn-block" onclick="sampleButtonClicked()">Analyse</button>
      </div>`;
  }

  function generatevisualisationViewHTML_old(module){
  if ($(window).width() < 768) {
    // do something for small screens
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
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(1, false)">
            <span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(5, false)">
            <span class="glyphicon glyphicon-forward" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(1, true)">
            <span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(5, true)">
            <span class="glyphicon glyphicon-forward" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="distSequence(900, true)">
            <span class="glyphicon glyphicon-flash" aria-hidden="true"></span>
          </button>
          <button type="button" class="btn btn-default" aria-label="Back" onclick="showCI()">
            <span class="glyphicon glyphicon-stats" aria-hidden="true"></span>
          </button>
        </div>
        <input id="visAnimProgress" type="range" min="0" list="stages">
        <datalist id="stages"></datalist>
      </div>
    </div>
    `;
  }else{
    return `
    <div id="visualisationView">
      <div id="takeSamplesProgressContainer" class="progress">
        <div id="takeSamplesProgress" class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
          <span class="sr-only">0% Complete</span>
        </div>
      </div>
      <div id="visControls">
        <div id="control-section-1" class ="control-section">
          <button type="button" class="btn btn-primary btn-block" aria-label="Back" onclick="sampleOptionsSwitch()">
            <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
            Back to options
        </button>

        <div id="animationPlayback" class="playSection panel panel-default">
          <div class="panel-heading text-center">Playback Controls</div>
            <button id="pausePlay" type="button" class="btn btn-default" aria-label="Back" onclick="pauseToggle()">
                <span class="glyphicon glyphicon-pause" aria-hidden="true"></span>
              </button>
            <input id="visAnimProgress" type="range" min="0" list="stages">
            <datalist id="stages"></datalist>
          </div>
        </div>

        <div id="control-section-2" class ="control-section">
          <div id="samplePlayButtons" class="playSection panel panel-default">
            <div class="panel-heading text-center">${module.playSectionLabels[0]}</div>
            <div class = "row">
              <div class="col-md-8 radioOption">
                <input id="sampleOptions" type="radio" name="sampleOptions" value="1" checked>
                <label>1</label>
              </div>
            </div>
            <div class = "row">
              <div class="col-md-8 radioOption">
                <input id="sampleOptions" type="radio" name="sampleOptions" value="5">
                <label>5</label>
              </div>
            </div>
            <div class = "row">
              <div class="panelButton col-md-11 ">
                <button type="button" class="btn btn-primary btn-block" aria-label="Back" onclick="readDistSequence('sampleOptions')">
                    Go
                </button> 
              </div>
            </div>  
          </div>
        </div>

        <div id="control-section-3" class ="control-section">
          <div id="buttonBar">
            <div id="distPlayButtons" class="playSection panel panel-default">
              <div class="panel-heading text-center">${module.playSectionLabels[1]}</div>
              <div class = "row">
                <div class="col-md-8 radioOption">
                  <input id="distOptions" type="radio" name="distOptions" value="1" checked>
                  <label>1</label>
                </div>
              </div>
              <div class = "row">
                <div class="col-md-8 radioOption">
                  <input id="distOptions" type="radio" name="distOptions" value="5">
                  <label>5</label>
                </div>
              </div>
              <div class = "row">
                <div class="col-md-8 radioOption">
                  <input id="distOptions" type="radio" name="distOptions" value="900">
                  <label>1000</label>
                </div>
              </div>
              <div class = "row">
                <div class="panelButton col-md-11 ">
                  <button type="button" class="btn btn-primary btn-block" aria-label="Back" onclick="readDistSequence('distOptions')">
                      Go
                  </button> 
                </div>
              </div>
              <div class = "row">
                <div class="panelButton col-md-11 ">
                  <button type="button" class="btn btn-default btn-block" aria-label="Back" onclick="showCI()">
                  <span class="glyphicon glyphicon-stats" aria-hidden="true"></span>
                  Show CI
                  </button> 
                </div>
              </div> 
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }
}

function generateSampleOptionsHTML_old(module, type, sampleSizeFixed){
  var sampleSizeRange = [1, getSampleSizeMax()];
  return `
  <div id="sampleOptions">
    <button type="button" class="bluebutton btn btn-default" aria-label="Back" onclick="fileOptionsSwitch()">
        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
        Back to File Select
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