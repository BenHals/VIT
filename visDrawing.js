let defaultDrawFuncs = {
    "datapoint": function(e, ctx){
        let stroke_opacity = e.getAttr('stroke-opacity') || 1;
        let fill_opacity = e.getAttr('fill-opacity') || 0;
        ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${fill_opacity})`;
        ctx.strokeStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${stroke_opacity})`;
        let offset = 5;
        ctx.fillRect(e.attrs.x - offset, e.attrs.y - offset, offset*2, offset * 2); 
        ctx.strokeRect(e.attrs.x - offset, e.attrs.y - offset, offset*2, offset * 2);
    },
    "prop": function(e, ctx){
        ctx.fillStyle = "rgba("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+", 0.4)";
        ctx.fillRect(e.attrs.x, e.attrs.y, e.attrs.width, e.attrs.height); 
    },
    "text": function(e, ctx){
        ctx.fillStyle = "#000000";
        ctx.font = '20px serif';
        ctx.textAlign = e.attrs['align'];
        ctx.textBaseline = e.attrs['baseline'];
        ctx.fillText(e.attrs.text, e.attrs.x, e.attrs.y);
    },
    "line": function(e, ctx){
        ctx.save();
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(e.getAttr('x1'), e.getAttr('y1'));
        ctx.lineTo(e.getAttr('x2'), e.getAttr('y2'));
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    },
    "distribution": function(e, ctx){
        ctx.fillStyle = "rgba("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+", 0.4)";
        let offset = 5;
        ctx.fillRect(e.attrs.x - offset, e.attrs.y - offset, offset*2, offset * 2); 
    },
}

function clearCtx(ctx){
    if(ctx){
        var canvas = $('#popCanvas');
        if(!ctx) return;
        ctx.clearRect(0,0, canvas.attr("width"), canvas.attr("height"));
    }
}