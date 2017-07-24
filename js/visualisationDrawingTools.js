var groupColorsList = [ "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
var proportionColorsList = ["#3366cc", "#dc3912",'#1b9e77','#d95f02','#7570b3'];
class visElement {
    constructor(type, id, ctx){
        this.elements = [];
        this.type = type;
        this.id = id;
        this.ctx = ctx;

        this.boundingBox = [0,0,0,0];
        this.bbWidth = 0;
        this.bbHeight = 0;

        this.relativeBoundingBox = [0, 0, 0, 0];
        this.relativeTo = null;

        this.centerX = 0;
        this.centerY = 0;

        this.parent = null;

        if(type == 'text'){
            this.text = "";
            this.drawSelf = drawText.bind(this, 'black', 'alphabetic', 'start');
        }

        this.visible = true;
    }

    setBoundingBox(x1,y1,x2,y2){
        this.boundingBox = [x1,y1,x2,y2];
        this.centerX = (x2-x1)/2 + x1;
        this.centerY = (y2-y1)/2 + y1;

        this.bbWidth = x2-x1;
        this.bbHeight = y2-y1;
        this.refreshChildPosition();
    }
    refreshChildPosition(){
        for(var i =0; i < this.elements.length; i++){
            this.elements[i].parentMoved(this.boundingBox);
        }
    }
    setRelativeBoundingBox(x1,y1,x2,y2, relativeTo){
        this.relativeTo = relativeTo;
        this.relativeBoundingBox = [x1,y1,x2,y2];
        var anchor = [relativeTo[0], relativeTo[1]];
        this.setBoundingBox(anchor[0]+x1,anchor[1]+y1,anchor[0]+x2,anchor[1]+y2);
        this.refreshChildPosition();
    }
    setRelativeCenter(x,y, relativeTo){
        var w2 = this.bbWidth/2;
        var h2 = this.bbHeight/2;
        this.setRelativeBoundingBox(x - w2,
                                    y - h2,
                                    x + w2,
                                    y + h2, relativeTo);
    }
    parentMoved(parentBB){
        var x1 = this.relativeBoundingBox[0];
        var y1 = this.relativeBoundingBox[1];
        var x2 = this.relativeBoundingBox[2];
        var y2 = this.relativeBoundingBox[3];
        this.setRelativeBoundingBox(x1,y1,x2,y2, parentBB);
        this.refreshChildPosition();
    }
    setCenter(x,y){
        this.centerX = x;
        this.centerY = y;

        this.boundingBox = [x-this.bbWidth/2, y-this.bbHeight/2,
                            x+this.bbWidth/2, y+this.bbHeight/2];
    }

    update(){
        for(var i =0; i < this.elements.length; i++){
            this.elements[i].update();
        }
        this.updateSelf();
    }
    updateSelf(){

    }
    draw(){
        for(var i =0; i < this.elements.length; i++){
            this.elements[i].draw();
        }
        if(this.visible){
            this.drawSelf();
        }
    }
    show(){
        this.visible = true;
    }
    hide(){
        this.visible = false;
    }
    drawSelf(){
        //this.renderBB();
    }
    renderBB(){
        this.ctx.strokeRect(this.boundingBox[0], this.boundingBox[1], this.bbWidth, this.bbHeight);
    }

    addChild(child){
        this.elements.push(child);
        child.parent = this;
    }

    setText(text){
        this.text = text;
    }

    setTextColor(color){
        // WARNING resets to alphabetic and start.
        this.textColor = color;
        this.drawSelf = drawText.bind(this, color, 'alphabetic', 'start');
    }

    setScale(scale){
        this.scale = scale;
    }
}

function createSections(canvas, ctx, marginHorizontal, marginVertical){
    var sections = {};
    var totalWidth = canvas.width() - marginHorizontal*2;
    var tottalHeight = canvas.height() - marginVertical*2;

    var sectionHeight = tottalHeight/3;

    var s1 = new visElement('rect', 's1', ctx);
    s1.setBoundingBox(marginHorizontal,marginVertical,totalWidth,sectionHeight + marginVertical);
    var s2 = new visElement('rect', 's2', ctx);
    s2.setBoundingBox(marginHorizontal,sectionHeight + marginVertical,totalWidth,sectionHeight*2 + marginVertical);
    var s3 = new visElement('rect', 's2', ctx);
    s3.setBoundingBox(marginHorizontal,sectionHeight*2 + marginVertical,totalWidth,sectionHeight*3 + marginVertical);
    sections['s1'] = s1;
    sections['s2'] = s2;
    sections['s3'] = s3;

    for(var s in sections){
        var section = sections[s];

        var title = new visElement('rect', 's'+s+'Title', ctx);
        section.addChild(title);
        var titleHeight = section.bbHeight * 0.1;
        title.setRelativeBoundingBox(0,0, section.bbWidth, titleHeight, section.boundingBox);

        var display = new visElement('rect', 's'+s+'Display', ctx);
        section.addChild(display);
        var displayHeight = section.bbHeight * 0.8;
        display.setRelativeBoundingBox(0,titleHeight, section.bbWidth, titleHeight + displayHeight, section.boundingBox);

        var footer = new visElement('rect', 's'+s+'Footer', ctx);
        section.addChild(footer);
        var footerHeight = section.bbHeight * 0.1;
        footer.setRelativeBoundingBox(0,titleHeight + displayHeight, section.bbWidth, titleHeight + displayHeight + footerHeight, section.boundingBox);
    }
    return sections;
}
function clearScreen(ctx){
    var canvas = $('#popCanvas');
    if(!ctx) return;
    ctx.clearRect(0,0, canvas.attr("width"), canvas.attr("height"));
}

function drawProportionBar(color){
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(this.boundingBox[0], this.boundingBox[1], this.bbWidth, this.bbHeight);
    this.ctx.restore();
}

function drawText(color, baseline, align, text, bb){
    if(!text) text = this.text;
    if(!bb) bb = this.boundingBox;
    this.ctx.save();
    this.ctx.font = '1em Helvetica';
    this.ctx.textBaseline = baseline;
    this.ctx.textAlign = align;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, bb[0], bb[3] - 2);
    this.ctx.restore();
}

function drawLine(color, dash, bb){
    if(!bb) bb = this.boundingBox;
    this.ctx.save();
    this.ctx.strokeStyle = color;
    if(dash) this.ctx.setLineDash([5, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(bb[0], bb[1]);
    this.ctx.lineTo(bb[2],bb[3]);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
}

function drawArrow(color, arrowHeadSize, bb){
    if(!bb) bb = this.boundingBox;
    var direction = bb[2] > bb[0] ? 1 : -1;
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(bb[0], bb[1]);
    this.ctx.lineTo(bb[2],bb[3]);
    this.ctx.lineTo(bb[2] - (arrowHeadSize * direction), bb[3] - arrowHeadSize);
    this.ctx.moveTo(bb[2],bb[3]);
    this.ctx.lineTo(bb[2] - (arrowHeadSize * direction), bb[3] + arrowHeadSize);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
}

function drawAxis(){
    var count = 10;
    var extent = this.scale.domain();
    console.log(extent);
    var start = extent[0];
    var stop = extent[1];
    var step = tickStep(start, stop, count);

    this.ctx.beginPath();
    this.ctx.moveTo(this.boundingBox[0], this.boundingBox[1]);
    this.ctx.lineTo(this.boundingBox[2], this.boundingBox[1]);
    var value = start;
    var tick = 0;
    while(value <= stop){
        this.ctx.moveTo(this.scale(value), this.boundingBox[1]);
        this.ctx.lineTo(this.scale(value), this.boundingBox[1] + 10);
        var lebelValue = Math.abs(parseFloat(value.toPrecision(12))) > 0.0001 ? parseFloat(value.toPrecision(12)) : 0;
        drawText.bind(this, "black", 'hanging', 
            tick == 0 ? 'start' : value+step > stop ? 'end' : 'center',
            lebelValue.toString(), [this.scale(value), this.boundingBox[1] + 10, this.scale(value) + 5, this.boundingBox[1] + 15])();
        value += step;
        tick++;
    }
    this.ctx.closePath();
    this.ctx.stroke();
}


// FROM d3-array
// https://github.com/d3/d3-array/blob/master/src/ticks.js
function tickIncrement(start, stop, count) {
    var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);
    var step = (stop - start) / Math.max(0, count),
        power = Math.floor(Math.log(step) / Math.LN10),
        error = step / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
    var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);
    var step0 = Math.abs(stop - start) / Math.max(0, count),
        step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
        error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
}