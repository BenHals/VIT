let defaultDrawFuncs = {
    "datapoint": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#7E8F7C';
        let [stroke_color, fill_color] = elementColor(e, ctx, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        let offset = 5;
        ctx.translate(0.5, 0.5);
        // ctx.fillRect(parseInt(e.attrs.x - offset),
        //             parseInt(e.attrs.y - offset),
        //             parseInt(offset*2),
        //             parseInt(offset * 2)); 
        // ctx.strokeRect(parseInt(e.attrs.x - offset),
        //             parseInt(e.attrs.y - offset),
        //             parseInt(offset*2),
        //             parseInt(offset * 2));
        ctx.beginPath();
        ctx.arc(parseInt(e.attrs.x),
                parseInt(e.attrs.y),
                10,
                0,
                Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.translate(-0.5, -0.5);
    },
    "prop": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? '#7D1935' : '#4A96AD';
        let [stroke_color, fill_color] = elementColor(e, ctx, backup_color, backup_color, 1);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        ctx.translate(0.5, 0.5);
        ctx.fillRect(parseInt(e.attrs.x),
            parseInt(e.attrs.y),
            parseInt(e.attrs.width),
            parseInt(e.attrs.height));
        ctx.strokeRect(parseInt(e.attrs.x),
            parseInt(e.attrs.y),
            parseInt(e.attrs.width),
            parseInt(e.attrs.height));
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let font = Math.min(e.attrs.height, e.attrs.width);
        ctx.font = font+'px sans-serif';
        ctx.fillStyle = d3.color(fill_color).brighter(1.5);
        ctx.strokeStyle = 'black';
        ctx.fillText(Math.round(e.getAttr('items')),
            parseInt(e.attrs.x +(e.attrs.width / 2)),
            parseInt(e.attrs.y + e.attrs.height/2));
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '15px sans-serif';
        ctx.fillText(e.getAttr('text'),
            parseInt(e.attrs.x + 1),
            parseInt(e.attrs.y));
        ctx.translate(-0.5, -0.5);
    },
    "prop-text": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? '#7D1935' : '#4A96AD';
        let [stroke_color, fill_color] = elementColor(e, ctx, backup_color, backup_color, 1);
        e.setAttr('stroke-color', stroke_color);
        e.setAttr('fill-color', fill_color);
        defaultDrawFuncs['text'](e, ctx);
    },
    "text": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#000000';
        let [stroke_color, fill_color] = elementColor(e, ctx, backup_color, backup_color, 1);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        ctx.font = '15px sans-serif';
        ctx.textAlign = e.attrs['align'];
        ctx.textBaseline = e.attrs['baseline'];
        ctx.fillText(e.attrs.text, e.attrs.x, e.attrs.y);
        //ctx.strokeText(e.attrs.text, e.attrs.x, e.attrs.y);
    },
    "line": function(e, ctx){
        ctx.save();
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#000000';
        let [stroke_color, fill_color] = elementColor(e, ctx, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(parseInt(e.getAttr('x1')), parseInt(e.getAttr('y1')));
        ctx.lineTo(parseInt(e.getAttr('x2')), parseInt(e.getAttr('y2')));
        ctx.closePath();
        ctx.stroke();
        ctx.translate(-0.5, -0.5);
        ctx.restore();
    },
    "down-arrow": function(e, ctx){
        ctx.save();
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#C63D0F';
        let [stroke_color, fill_color] = elementColor(e, ctx, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        let x1 = e.getAttr('x1');
        let x2 = e.getAttr('x2');
        let y1 = e.getAttr('y1');
        let y2 = e.getAttr('y2');
        let direction = (y2 - y1) > 0 ? 1 : -1;
        let arrow_head_y = y2 - direction * 5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2 + direction * 3, arrow_head_y);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - direction * 3, arrow_head_y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    },
    "arrow": function(e, ctx){
        ctx.save();
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#1C3F95';
        let [stroke_color, fill_color] = elementColor(e, ctx, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        let x1 = e.getAttr('x1');
        let x2 = e.getAttr('x2');
        let y1 = e.getAttr('y1');
        let y2 = e.getAttr('y2');
        let direction = (x2 - x1) > 0 ? 1 : -1;
        let arrow_head_x = x2 - direction * 5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(arrow_head_x, y2 + direction * 3);
        ctx.moveTo(x2, y2);
        ctx.lineTo(arrow_head_x, y2 - direction * 3);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    },
    "distribution": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#1C3F95';
        // if(!(e.getAttr('in_ci'))){
        //     backup_color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;
        // }
        let [stroke_color, fill_color] = elementColor(e, ctx, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        let offset = 5;
        ctx.translate(0.5, 0.5);
        //ctx.fillRect(e.attrs.x - offset, e.attrs.y - offset, offset*2, offset * 2);
        ctx.beginPath();
        ctx.arc(parseInt(e.attrs.x),
                parseInt(e.attrs.y),
            2,
            0,
            Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.translate(-0.5, -0.5);
    },
    "axis": function(e, ctx){
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        let vertical = e.getAttr('vertical');
        let x1 = e.getAttr('x1');
        let x2 = e.getAttr('x2');
        let y1 = e.getAttr('y1');
        let y2 = e.getAttr('y2');
        if(!vertical){
            ctx.moveTo(parseInt(x1), parseInt(y1));
            ctx.lineTo(parseInt(x2), parseInt(y1));
        }else{
            ctx.moveTo(parseInt(x2), parseInt(y1));
            ctx.lineTo(parseInt(x2), parseInt(y2));
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
                ctx.moveTo(parseInt(tick_screen_x), parseInt(y1));
                ctx.lineTo(parseInt(tick_screen_x), parseInt(y_half));
            }else{
                ctx.moveTo(parseInt(x2), parseInt(tick_screen_x));
                ctx.lineTo(parseInt(y_half), parseInt(tick_screen_x));
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

        ctx.translate(-0.5, -0.5);
    }
}

function elementColor(e, ctx, s_c, f_c, backup_opacity){
    backup_opacity = backup_opacity || 0;
    let stroke_opacity = e.getAttr('stroke-opacity') == undefined ? 1 : e.getAttr('stroke-opacity');
    let fill_opacity = e.getAttr('fill-opacity') == undefined ? backup_opacity : e.getAttr('fill-opacity');
    let fill_c = e.getAttr('fill-color') ? e.getAttr('fill-color') : f_c ? f_c : 'black';
    let stroke_c = e.getAttr('stroke-color') ? e.getAttr('stroke-color') : s_c ? s_c : 'black';
    let stroke_color = d3.color(stroke_c);
    stroke_color.opacity = stroke_opacity;
    let fill_color = d3.color(fill_c);
    fill_color.opacity = fill_opacity;
    return [stroke_color, fill_color];
}
function clearCtx(ctx){
    if(ctx){
        var canvas = $('#popCanvas');
        if(!ctx) return;
        ctx.clearRect(0,0, canvas.attr("width")*2, canvas.attr("height"));
    }
}