

const view = {
    switchModule: function(module_html, genControls){
        $('#moduleContent').html(module_html);
        if(genControls) this.loadControls(genControls);
        $('#sampleButton').hide();
    },

    loadControls: function(genControls){
        let use_old = model.useOld();
        let module_name = model.getModuleName();
        let [control_html, populators] = genControls(use_old, module_name);

        // Set the html.
        $('#controls').html(control_html);

        // Populate dynamic fields.
        populators.forEach((genItems)=>{genItems()});
    },
}