

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

    loadDataDisplay: function(dataset){
        let [html, populators] = generateDataDisplay(dataset);
        
        // Set the html.
        $('#dataDisplay').html(html);

        // Populate dynamic fields.
        populators.forEach((genItems)=>{genItems()});
    },

    loadCanvas: function(){
        $('#visualisation').html(`<div id="canvasWrapper">
            <canvas id="popCanvas" class="mainCanvas"></canvas>
            <canvas id="dynamicCanvas" class="mainCanvas"></canvas>
            <svg id="popSVG" class="mainCanvas"><g id="popSvgContainer"></g></svg>
            <svg id="dynamicSVG" class="mainCanvas"><g id="dynSvgContainer"></g></svg>
            </div>`);
        this.resizeCanvas(true);
    },
    resizeCanvas: function(init){
        vis_width = $('#canvasWrapper').innerWidth();
        vis_height = $('#canvasWrapper').innerHeight();
        $('#popCanvas').attr('width', vis_width);
        $('#popCanvas').attr('height', vis_height);
        let scale_factor = ($('#popCanvas').attr('width') / $('#popCanvas').attr('data-normWidth'))
        $('#dynamicCanvas').attr('width', vis_width);
        $('#dynamicCanvas').attr('height', vis_height);
        if(init){
            $('#dynamicSVG').attr('data-normWidth', vis_width);
            $('#dynamicSVG').attr('data-normHeight', vis_height);
            $('#dynamicCanvas').attr('data-normWidth', vis_width);
            $('#dynamicCanvas').attr('data-normHeight', vis_height);
            $('#popCanvas').attr('data-normWidth', vis_width);
            $('#popCanvas').attr('data-normHeight', vis_height);
            $('#dynamicSVG').attr('width', vis_width);
            $('#dynamicSVG').attr('height', vis_height);
            $('#popSVG').attr('width', vis_width);
            $('#popSVG').attr('height', vis_height);
        }
        let canvas_rect = document.getElementById('popCanvas');
        if(!canvas_rect){
            return
        }
        canvas_rect = canvas_rect.getBoundingClientRect();
        let shift = (vis_width - $('#popCanvas').attr('data-normWidth'))/2;
        //$('#dynamicSVG').attr('width', vis_width);
        //$('#dynamicSVG').attr('height', vis_height);
        $('#dynamicSVG').attr('transform', "scale("+scale_factor+",1)");
        let dRect = document.getElementById('dynamicSVG').getBoundingClientRect();
        //$('#popSVG').attr('transform', "translate("+$('#popSVG').attr('width')/2+","+$('#popSVG').attr('height')/2 + ") scale("+scale_factor+",1) translate("+-1*$('#popSVG').attr('width')/2+","+-1*$('#popSVG').attr('height')/2 + ")");
        $('#dynamicSVG').attr('transform', "scale("+scale_factor+",1) translate("+(canvas_rect.left - dRect.left)/scale_factor+",0)");

        //$('#popSVG').attr('width', vis_width);
        //$('#popSVG').attr('height', vis_height);
        $('#popSVG').attr('transform', "scale("+scale_factor+",1)");
        let pRect = document.getElementById('popSVG').getBoundingClientRect();
        //$('#popSVG').attr('transform', "translate("+$('#popSVG').attr('width')/2+","+$('#popSVG').attr('height')/2 + ") scale("+scale_factor+",1) translate("+-1*$('#popSVG').attr('width')/2+","+-1*$('#popSVG').attr('height')/2 + ")");
        $('#popSVG').attr('transform', "scale("+scale_factor+",1) translate("+(canvas_rect.left - pRect.left)/scale_factor+",0)");

        return scale_factor;
    }
}