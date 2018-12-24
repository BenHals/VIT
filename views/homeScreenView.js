var homeHTML = `
<div id="homeContent">
    <div id="contentContainer">
        <div class="menutitle"><p class="menutitle t2">V</p><p class ="menutitle t1">I</p><p class ="menutitle t2">T Online</p> </div>
        <div id = "discription">
            <p> The capabilities of iNZightVIT's  Visual inference Tools (VIT) modules are being reworked in JavaScript by Ben Halsted for online use.  Try in Chrome, Firefox or Safari (not IE). <br>
            <i>This short video gives some idea of how it works <a href="https://www.stat.auckland.ac.nz/~wild/VITonline/VIT_bootstrap1.mp4 ">VIT_bootstrap1.mp4)</a></i></p>
        </div>

        <div id = buttonContainer>
            <button class="btn btn-primary btn-block" onclick="hs_loadModuleEvent('Sampling Variation')">Sampling Variation</button>
            <button class="btn btn-primary btn-block" onclick="hs_loadModuleEvent('Bootstrapping')">Bootstrapping</button>
            <button class="btn btn-primary btn-block" onclick="hs_loadModuleEvent('Randomisation Variation')">Randomisation Variation</button>
            <button class="btn btn-primary btn-block" onclick="hs_loadModuleEvent('Randomisation Test')">Randomisation Test</button>
            <button class="btn btn-primary btn-block" onclick="hs_loadModuleEvent('Confidence Interval')">Confidence Interval Coverage</button>
        </div>
    </div>
</div>
`;

function generateHomeHTML(){
    return homeHTML;
}

// ********** Home Screen Events **********
function hs_loadModuleEvent(module_name){
    controller.loadModule(module_name);
}

// ********** Home Screen Updates **********