
let PIXEL_RATIO = window.devicePixelRatio;      
function windowResize(){
    PIXEL_RATIO = window.devicePixelRatio > 1 ? window.devicePixelRatio  : 1;
    console.log(PIXEL_RATIO);
    controller.resizeVis(true);
}
window.addEventListener("resize", windowResize);

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
            <canvas id="staticOnTopCanvas" class="mainCanvas"></canvas>
            <svg id="popSVG" class="mainCanvas"><g id="popSvgContainer"></g></svg>
            <svg id="dynamicSVG" class="mainCanvas"><g id="dynSvgContainer"></g></svg>
            </div>`);
        this.resizeCanvas(true);
    },
    resizeCanvas: function(init){
        let canvas = document.getElementById('popCanvas');
        let dynamicCanvas = document.getElementById('dynamicCanvas');
        let staticOnTopCanvas = document.getElementById('staticOnTopCanvas');
        if(canvas == null){
            return {"scale_x": 1, "scale_y": 1,  "PIXEL_RATIO": 1};
        }
        let ctx = canvas.getContext('2d');
        let dynamicCtx = dynamicCanvas.getContext('2d');
        let staticOnTopCtx = staticOnTopCanvas.getContext('2d');

        
        vis_width = $('#canvasWrapper').innerWidth();
        vis_height = $('#canvasWrapper').innerHeight();
        $('#popCanvas').attr('width', vis_width * PIXEL_RATIO);
        $('#popCanvas').attr('height', vis_height * PIXEL_RATIO);
        $('#dynamicCanvas').attr('data-pixelratio', PIXEL_RATIO);
        $('#popCanvas').attr('data-pixelratio', PIXEL_RATIO);
        $('#staticOnTopCanvas').attr('data-pixelratio', PIXEL_RATIO);

        let scale_factor = (($('#popCanvas').attr('width')) / $('#popCanvas').attr('data-normWidth'))
        $('#dynamicCanvas').attr('width', vis_width * PIXEL_RATIO);
        $('#dynamicCanvas').attr('height', vis_height * PIXEL_RATIO);
        
        $('#staticOnTopCanvas').attr('width', vis_width * PIXEL_RATIO);
        $('#staticOnTopCanvas').attr('height', vis_height * PIXEL_RATIO);
        // $('#popCanvas').attr('transform', "scale("+scale_factor / PIXEL_RATIO+",1)");
        $('#popCanvas').attr('style', `width: ${vis_width}px; height: ${vis_height}px`);
        $('#dynamicCanvas').attr('style', `width: ${vis_width}px; height: ${vis_height}px`);
        $('#staticOnTopCanvas').attr('style', `width: ${vis_width}px; height: ${vis_height}px`);
        
        // ctx.setTransform(scale_factor / PIXEL_RATIO, 0, 0, 1 / PIXEL_RATIO, 0, 0);
        // dynamicCtx.setTransform(scale_factor / PIXEL_RATIO, 0, 0, 1 / PIXEL_RATIO, 0, 0);
        // staticOnTopCtx.setTransform(scale_factor / PIXEL_RATIO, 0, 0, 1 / PIXEL_RATIO, 0, 0);
        ctx.setTransform(scale_factor, 0, 0, 1 , 0, 0);
        dynamicCtx.setTransform(scale_factor , 0, 0, 1 , 0, 0);
        staticOnTopCtx.setTransform(scale_factor , 0, 0, 1 , 0, 0);
        // ctx.scale(scale_factor / PIXEL_RATIO, 1 / PIXEL_RATIO);
        if(init){
            
            $('#dynamicSVG').attr('data-normWidth', vis_width);
            $('#dynamicSVG').attr('data-normHeight', vis_height);
            $('#dynamicCanvas').attr('data-normWidth', vis_width * PIXEL_RATIO);
            $('#dynamicCanvas').attr('data-normHeight', vis_height * PIXEL_RATIO);
            
            $('#staticOnTopCanvas').attr('data-normWidth', vis_width * PIXEL_RATIO);
            $('#staticOnTopCanvas').attr('data-normHeight', vis_height * PIXEL_RATIO);
            
            $('#popCanvas').attr('data-normWidth', vis_width * PIXEL_RATIO);
            $('#popCanvas').attr('data-normHeight', vis_height * PIXEL_RATIO);
            
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

        return {"scale_x": 1, "scale_y": 1,  "PIXEL_RATIO": 1};
    }
}