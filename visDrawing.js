let defaultDrawFuncs = {
    "datapoint": function(e, ctx){
        let stroke_opacity = e.getAttr('stroke-opacity') == undefined ? 1 : e.getAttr('stroke-opacity');
        let fill_opacity = e.getAttr('fill-opacity') == undefined ? 0 : e.getAttr('fill-opacity');
        ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${fill_opacity})`;
        ctx.strokeStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${stroke_opacity})`;
        let offset = 5;
        ctx.fillRect(e.attrs.x - offset, e.attrs.y - offset, offset*2, offset * 2); 
        ctx.strokeRect(e.attrs.x - offset, e.attrs.y - offset, offset*2, offset * 2);
    },
    "prop": function(e, ctx){
        let stroke_opacity = e.getAttr('stroke-opacity') == undefined ? 1 : e.getAttr('stroke-opacity');
        let fill_opacity = e.getAttr('fill-opacity') == undefined ? 1 : e.getAttr('fill-opacity');
        ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${fill_opacity})`;
        ctx.strokeStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${stroke_opacity})`;
        ctx.fillRect(e.attrs.x, e.attrs.y, e.attrs.width, e.attrs.height); 
    },
    "text": function(e, ctx){
        let stroke_opacity = e.getAttr('stroke-opacity') == undefined ? 1 : e.getAttr('stroke-opacity');
        let fill_opacity = e.getAttr('fill-opacity') == undefined ? 1 : e.getAttr('fill-opacity');
        ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${fill_opacity})`;
        ctx.strokeStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${stroke_opacity})`;
        ctx.font = '20px serif';
        ctx.textAlign = e.attrs['align'];
        ctx.textBaseline = e.attrs['baseline'];
        ctx.fillText(e.attrs.text, e.attrs.x, e.attrs.y);
    },
    "line": function(e, ctx){
        ctx.save();
        let stroke_opacity = e.getAttr('stroke-opacity') == undefined ? 1 : e.getAttr('stroke-opacity');
        let fill_opacity = e.getAttr('fill-opacity') == undefined ? 1 : e.getAttr('fill-opacity');
        ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${fill_opacity})`;
        ctx.strokeStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${stroke_opacity})`;
        ctx.beginPath();
        ctx.moveTo(e.getAttr('x1'), e.getAttr('y1'));
        ctx.lineTo(e.getAttr('x2'), e.getAttr('y2'));
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    },
    "distribution": function(e, ctx){
        let stroke_opacity = e.getAttr('stroke-opacity') == undefined ? 1 : e.getAttr('stroke-opacity');
        let fill_opacity = e.getAttr('fill-opacity') == undefined ? 1 : e.getAttr('fill-opacity');
        ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${fill_opacity})`;
        ctx.strokeStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)}, ${stroke_opacity})`;
        let offset = 5;
        ctx.fillRect(e.attrs.x - offset, e.attrs.y - offset, offset*2, offset * 2); 
    },
    "axis": function(e, ctx){
        ctx.beginPath();
        let vertical = e.getAttr('vertical');
        let x1 = e.getAttr('x1');
        let x2 = e.getAttr('x2');
        let y1 = e.getAttr('y1');
        let y2 = e.getAttr('y2');
        if(!vertical){
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
        }else{
            ctx.moveTo(x2, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.stroke();
        let tick_x = e.getAttr('min');
        ctx.font = '10px serif';
        ctx.textAlign = !vertical ? 'center' : 'end';
        ctx.textBaseline = !vertical ? 'hanging' : 'middle';
        let tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [x1, x2]);
        if(vertical){
            tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [y2, y1]);
        }
        let stopper = !vertical ? x2 : y1;
        do{
            tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [x1, x2]);
            let y_half = y1 + (y2 - y1)/3;
            if(vertical){
                tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [y2, y1]);
                y_half = x2 - (x2 - x1)/3;
            }
            
            ctx.beginPath();
            if(!vertical){
                ctx.moveTo(tick_screen_x, y1);
                ctx.lineTo(tick_screen_x, y_half);
            }else{
                ctx.moveTo(x2, tick_screen_x);
                ctx.lineTo(y_half, tick_screen_x);
            }
            ctx.closePath();
            ctx.stroke();
            if(!vertical){
                ctx.fillText(Math.round(tick_x*100)/100, tick_screen_x, y_half);
            }else{
                ctx.fillText(Math.round(tick_x*100)/100, y_half, tick_screen_x);
            }
            tick_x += e.getAttr('step');
            tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [x1, x2]);
            if(vertical){
                tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [y2, y1]);
            }
        } while(!vertical ? tick_screen_x <= stopper : tick_screen_x >= stopper);
    }
}

function clearCtx(ctx){
    if(ctx){
        var canvas = $('#popCanvas');
        if(!ctx) return;
        ctx.clearRect(0,0, canvas.attr("width"), canvas.attr("height"));
    }
}