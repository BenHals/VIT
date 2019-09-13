let COMPONENT_SCALE = 1
var colorScale = ['#4A96AD','#7D1935', '#1b9e77', '#d95f02', '#7570b3']
let defaultDrawFuncs = {
    "datapoint": function(e, ctx){
        // let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : e.getAttr('stroke-color') ? d3.color(e.getAttr('stroke-color')).darker() : '#7E8F7C';
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : e.getAttr('stroke-color') ? d3.color(e.getAttr('stroke-color')).darker() : '#7E8F7C';
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        let offset = 5;
        ctx.lineWidth = 1 * COMPONENT_SCALE;
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
                (e.getAttr('r') || 5) * COMPONENT_SCALE,
                0,
                Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.translate(-0.5, -0.5);
    },
    "prop": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? config.proportionColorsList[0] : config.proportionColorsList[1];
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color, 1);
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
        let font = Math.min(e.attrs.height, e.attrs.width) * COMPONENT_SCALE;
        ctx.font = font+'px sans-serif';
        ctx.fillStyle = d3.color(fill_color).brighter(1.5);
        ctx.fillText(Math.round(e.getAttr('items')),
            parseInt(e.attrs.x +(e.attrs.width / 2)),
            parseInt(e.attrs.y + e.attrs.height/2));
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '15px sans-serif';
        ctx.fillText(e.getAttr('text'),
            parseInt(e.attrs.x + 1),
            parseInt(e.attrs.y));

        let items = parseInt(e.getAttr('items'));
        let width = e.attrs.width - 2;
        let height = e.attrs.height - 2;
        let min_r = 2;
        let max_r = Math.min(width, height);
        let radius = max_r;
        let rows = 1;
        let row_l = items;
        let max_row_length = width / (min_r * 2);
        let width_r = width / (row_l*2);
        let height_r = height / (rows*2);
        let it_max = 20;
        let it = 0;
        while(it < it_max && (max_row_length < row_l || height_r > width_r * 1.5)){
            rows++;
            row_l = Math.ceil(items/rows);
            width_r = width / (row_l*2);
            height_r = height / (rows*2);
            it++;
        }
        rows = Math.ceil(items/row_l);
        width_r = width / (row_l*2);
        height_r = height / (rows*2);
        radius = Math.min(width_r, height_r);
        let y_free_space = height - (rows * radius * 2);
        let y_top_margin = y_free_space / 2;
        let x_free_space = width - (row_l * radius * 2);
        let x_left_margin = x_free_space / 2;
        let r = 0;
        let c = 0;
        let lim = Math.min(items, max_row_length * (height / (min_r *2)), 500);
        for(let i = 0; i < lim; i++){

            let x = e.attrs.x + x_left_margin + radius + (radius * 2)*r;
            let y = e.attrs.y + y_top_margin + radius + (radius * 2)*c;
            ctx.fillStyle = d3.color(fill_color).brighter(0.5);
            ctx.beginPath();
            ctx.arc(x,
                    y,
                    radius,
                    0,
                    Math.PI * 2);
            ctx.stroke(); 
            ctx.fill();
            r++;
            if(r == row_l){
                c++;
                r = 0;
            }
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        font = Math.min(e.attrs.height, e.attrs.width);
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
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color, 1);
        e.setAttr('stroke-color', stroke_color);
        e.setAttr('fill-color', fill_color);
        defaultDrawFuncs['text'](e, ctx);
    },
    "text": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#000000';
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color, 1);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        ctx.font = `${15 * COMPONENT_SCALE}px sans-serif`;
        ctx.textAlign = e.attrs['align'];
        ctx.textBaseline = e.attrs['baseline'];
        ctx.fillText(e.attrs.text, e.attrs.x, e.attrs.y);
        //ctx.strokeText(e.attrs.text, e.attrs.x, e.attrs.y);
    },
    "dist_textbox": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#000000';
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color, 1);
        let color = d3.color("white");
        color.opacity = 0.8;
        ctx.fillStyle = color;
        ctx.strokeStyle = stroke_color;
        ctx.font = `${15 * COMPONENT_SCALE}px sans-serif`;
        ctx.textAlign = e.attrs['align'];
        ctx.textBaseline = e.attrs['baseline'];
        let max_width = Math.max(ctx.measureText("Coverage").width, ctx.measureText(e.attrs.text).width, ctx.measureText(e.getAttr("percentage-text")).width) + 5;
        ctx.fillRect(e.attrs.x - max_width / 2, e.attrs.y - 30, max_width, 50);
        ctx.fillStyle = fill_color;
        ctx.textAlign = "center";
        ctx.fillText("Coverage", e.attrs.x, e.attrs.y - 15);
        ctx.fillText(e.attrs.text, e.attrs.x, e.attrs.y);
        ctx.fillText(e.getAttr('percentage-text'), e.attrs.x, e.attrs.y + 15);
        //ctx.strokeText(e.attrs.text, e.attrs.x, e.attrs.y);
    },
    "line": function(e, ctx){
        ctx.save();
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#000000';
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        if(e.getAttr("dashed")){
            ctx.setLineDash([5, 8]);
        }
        ctx.lineWidth = (e.getAttr('lineWidth') ? e.getAttr('lineWidth') : 1) * COMPONENT_SCALE;
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
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        ctx.lineWidth = 3 * COMPONENT_SCALE
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
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        ctx.lineCap = "round";
        ctx.lineWidth = 3 * COMPONENT_SCALE;
        let x1 = e.getAttr('x1');
        let x2 = e.getAttr('x2');
        let y1 = e.getAttr('y1');
        let y2 = e.getAttr('y2');
        let arrow_head_size = 10;
        let direction = (x2 - x1) > 0 ? 1 : -1;
        let arrow_head_x = x2 - direction * arrow_head_size;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.moveTo(x2, y2);
        ctx.lineTo(arrow_head_x, y2 + direction * (arrow_head_size / 2));
        ctx.moveTo(x2, y2);
        ctx.lineTo(arrow_head_x, y2 - direction * (arrow_head_size / 2));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.restore();
    },
    "distribution": function(e, ctx){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#1C3F95';
        // if(!(e.getAttr('in_ci'))){
        //     backup_color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;
        // }
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        let offset = 5;
        ctx.translate(0.5, 0.5);
        //ctx.fillRect(e.attrs.x - offset, e.attrs.y - offset, offset*2, offset * 2);
        ctx.beginPath();
        ctx.arc(parseInt(e.attrs.x),
                parseInt(e.attrs.y),
            5 * COMPONENT_SCALE,
            0,
            Math.PI * 2);
        //ctx.fill();
        ctx.stroke();
        ctx.translate(-0.5, -0.5);
    },
    "distribution_range": function(e, ctx){
        if(e.getAttr('y') > e.lower_draw_bound) return;
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#1C3F95';
        backup_color = Math.round(e.getAttr('in_ci')) ? 'green' : 'red';
        // if(!(e.getAttr('in_ci'))){
        //     backup_color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;
        // }
        let [stroke_color, fill_color] = elementColor(e, backup_color, backup_color);
        ctx.fillStyle = fill_color;
        ctx.strokeStyle = stroke_color;
        let offset = 5;
        if(e.getAttr("dashed")){
            ctx.setLineDash([5, 8]);
        }
        ctx.lineWidth = e.getAttr('lineWidth') ? e.getAttr('lineWidth') : 1;
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.moveTo(parseInt(e.getAttr('ci_min')), parseInt(e.getAttr('y')));
        ctx.lineTo(parseInt(e.getAttr('ci_max')), parseInt(e.getAttr('y')));
        ctx.closePath();
        ctx.stroke();
        ctx.translate(-0.5, -0.5);
        ctx.restore();
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
        ctx.font = `${10 * COMPONENT_SCALE }px serif`;
        ctx.fillStyle = '#000';
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

let defaultSVGFuncs = {
    "datapoint": function(e, svg_id){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : e.getAttr('stroke-color') ? d3.color(e.getAttr('stroke-color')).darker() : '#7E8F7C';
        let backup_opacity = 0;
        let fill_color = e.getAttr('fill-color') ? e.getAttr('fill-color') : backup_color ? backup_color : 'black';
        let stroke_color = e.getAttr('stroke-color') ? e.getAttr('stroke-color') : backup_color ? backup_color : 'black';

        d3.select(svg_id).append('circle')
            .attr('id', e.svg_id)
            .attr('class', e.type)
            .attr('x', e.attrs.x)
            .attr('y', e.attrs.y)
            .attr('r', 5)
            .style('fill', fill_color)
            .style('stroke', stroke_color);
    },
    "prop": function(e, ctx){

    },
    "prop-text": function(e, ctx){

    }, 
    "text": function(e, svg_id){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#000000';
        let backup_opacity = 0;
        let fill_color = e.getAttr('fill-color') ? e.getAttr('fill-color') : backup_color ? backup_color : 'black';
        let stroke_color = e.getAttr('stroke-color') ? e.getAttr('stroke-color') : backup_color ? backup_color : 'black';
        e.setAttr('fill-opacity', 1);
        e.setAttr('stroke-width', 0);
        e.setAttr('fill-color', fill_color);

        d3.select(svg_id).append('text')
            .attr('id', e.svg_id)
            .attr('class', e.type)
            .attr('x', e.attrs.x)
            .attr('y', e.attrs.y)
            .attr('font-size', '15')
            .attr('text-anchor', e.attrs['align'])
            .attr('alignment-baseline', e.attrs['baseline'])
            .style('fill', fill_color)
            .style('stroke', stroke_color)
            .text(e.getAttr('text'));
    },
    "line": function(e, svg_id){
        let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#000000';
        let backup_opacity = 0;
        let fill_color = e.getAttr('fill-color') ? e.getAttr('fill-color') : backup_color ? backup_color : 'black';
        let stroke_color = e.getAttr('stroke-color') ? e.getAttr('stroke-color') : backup_color ? backup_color : 'black';
        e.setAttr('stroke-width', 10);
        e.setAttr('fill-color', fill_color);

        d3.select(svg_id).append('line')
            .attr('id', e.svg_id)
            .attr('class', e.type)
            .attr('x1', e.attrs.x1)
            .attr('x2', e.attrs.x2)
            .attr('y1', e.attrs.y1)
            .attr('y2', e.attrs.y2)
            .style('fill', fill_color)
            .style('stroke', stroke_color)
            .style('stroke-width', 10)
            .style('stroke-opacity', 0);
    },
    "down-arrow": function(e, ctx){

    },
    "arrow": function(e, ctx){

    },
    "distribution": function(e, ctx){

    },
    "axis": function(e, svg_id){
        let vertical = e.getAttr('vertical');
        let x1 = e.getAttr('x1');
        let x2 = e.getAttr('x2');
        let y1 = e.getAttr('y1');
        let y2 = e.getAttr('y2');
        let [start_x, start_y] = [parseInt(x1), parseInt(y1)];
        let [end_x, end_y] = [parseInt(x2), parseInt(y1)];

        if(vertical){
            [start_x, start_y] = [parseInt(x2), parseInt(y1)];
            [end_x, end_y] = [parseInt(x2), parseInt(y2)];
        }

        d3.select(svg_id).append('line')
        .attr('id', e.svg_id)
        .attr('class', e.type)
        .attr('x1', start_x)
        .attr('x2', end_x)
        .attr('y1', start_y)
        .attr('y2', end_y)
        .style('fill', 'black')
        .style('stroke', 'black')
        .style('stroke-opacity', 1);

        let tick_x = e.getAttr('min');

        let tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [x1, x2]);
        if(vertical){
            tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [y2, y1]);
        }
        let stopper = !vertical ? x2 : y1;
        let text_el = null;
        do{
            tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [x1, x2]);
            let y_half = y1 + (y2 - y1)/3;
            if(vertical){
                tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [y2, y1]);
                y_half = x2 - (x2 - x1)/3;
            }

            let [tick_start_x, tick_start_y] = [parseInt(tick_screen_x), parseInt(y1)];
            let [tick_end_x, tick_end_y] = [parseInt(tick_screen_x), parseInt(y_half)];
    
            if(vertical){
                [tick_start_x, tick_start_y] = [parseInt(x2), parseInt(tick_screen_x)];
                [tick_end_x, tick_end_y] = [parseInt(y_half), parseInt(tick_screen_x)];
            }
    
            d3.select(svg_id).append('line')
            .attr('id', e.svg_id)
            .attr('class', e.type)
            .attr('x1', tick_start_x)
            .attr('x2', tick_end_x)
            .attr('y1', tick_start_y)
            .attr('y2', tick_end_y)
            .style('fill', 'black')
            .style('stroke', 'black')
            .style('stroke-opacity', 1);

            // ctx.font = '10px serif';
            // ctx.fillStyle = '#000';
            // ctx.textAlign = !vertical ? 'center' : 'end';
            // ctx.textBaseline = !vertical ? 'hanging' : 'middle';
            // if(!vertical){
            //     ctx.fillText(Math.round(tick_x*100)/100, tick_screen_x, y_half);
            // }else{
            //     ctx.fillText(Math.round(tick_x*100)/100, y_half, tick_screen_x);
            // }
            let text_x = tick_screen_x;
            let text_y = y_half;
            if(vertical){
                text_x = y_half;
                text_y = tick_screen_x;
            }

            
            text_el = d3.select(svg_id).append('text')
                .attr('id', e.svg_id)
                .attr('class', e.type)
                .attr('x', text_x)
                .attr('y', text_y)
                .attr('font-size', '10')
                .attr('text-anchor', !vertical ? 
                    tick_x == e.getAttr('min') ? 'start' : 
                    'middle' : 'end')
                .attr('alignment-baseline', !vertical ? 'hanging' : 'middle')
                .style('fill', 'black')
                .style('stroke', 'black')
                .style('stroke-width', 0)
                .text(Math.round(tick_x*100)/100);

            tick_x += e.getAttr('step');
            tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [x1, x2]);
            if(vertical){
                tick_screen_x = linearScale(tick_x, [e.getAttr('min'), e.getAttr('max')], [y2, y1]);
            }
        } while(!vertical ? tick_screen_x <= stopper : tick_screen_x >= stopper);
        text_el.attr('text-anchor', 'end');
    }
}

let defaultSVGUpdates = {
    "datapoint": function(e){
        svgAttrUpdate(e);
    },
    "prop": function(e, ctx){

    },
    "prop-text": function(e, ctx){

    },
    "text": function(e){
        svgAttrUpdate(e);
        d3.select('#'+e.svg_id).text(e.getAttr('text'));
    },
    "line": function(e){
        svgAttrUpdate(e);
    },
    "down-arrow": function(e, ctx){

    },
    "arrow": function(e, ctx){

    },
    "distribution": function(e, ctx){

    },
    "axis": function(e, ctx){

    }
}

function svgAttrUpdate(e){
    let styles = ['fill-color', 'stroke-color', 'fill-opacity', 'stroke-opacity'];
    let svg_name_map = {'fill-color': 'fill', 'stroke-color': 'stoke',
                        'x': 'cx', 'y': 'cy',
                        'align': 'text-anchor', 'baseline': 'alignment-baseline',};

    let backup_color = Math.round(e.getAttr('selected')) ? '#C63D0F' : '#7E8F7C';
    if(Math.round(e.getAttr('selected'))){
        //console.log('sel');
    }
    let backup_fill_opacity = 0;
    let backup_stroke_opacity = e.type == 'line' ? 0 : 1;
    let fill_color = e.getAttr('fill-color') ? e.getAttr('fill-color') : backup_color ? backup_color : 'black';
    let stroke_color = e.getAttr('stroke-color') ? e.getAttr('stroke-color') : backup_color ? backup_color : 'black';
    let fill_opacity = e.getAttr('fill-opacity') != undefined ? e.getAttr('fill-opacity') : backup_fill_opacity;
    let stroke_opacity = e.getAttr('stroke-opacity') != undefined ? e.getAttr('stroke-opacity') : backup_stroke_opacity;

    //e.setAttr('fill-color', fill_color);
    //e.setAttr('stroke-color', stroke_color);
    e.setAttr('fill-opacity', fill_opacity);
    e.setAttr('stroke-opacity', stroke_opacity);
    d3.select('#'+e.svg_id).style('fill', fill_color);
    d3.select('#'+e.svg_id).style('stroke', stroke_color);
    for(let a in e.attrs){
        if(a == 'id') continue;
        let attr_name = a in svg_name_map ? svg_name_map[a] : a;
        let value = e.attrs[a];
        if(styles.includes(a)){
            d3.select('#'+e.svg_id).style(attr_name, value);
            d3.select('#'+e.svg_id).style(a, value);
        }else{
            d3.select('#'+e.svg_id).attr(attr_name, value);
            d3.select('#'+e.svg_id).attr(a, value);
        }
    }
}

function elementColor(e, s_c, f_c, backup_opacity){
    backup_opacity = backup_opacity || 0;
    let stroke_opacity = e.getAttr('stroke-opacity') == undefined ? 1 : e.getAttr('stroke-opacity');
    let fill_opacity = e.getAttr('fill-opacity') == undefined ? backup_opacity : e.getAttr('fill-opacity');
    
    let stroke_c = e.getAttr('stroke-color') ? e.getAttr('stroke-color') : s_c ? s_c : 'black';
    let fill_c = e.getAttr('fill-color') ? e.getAttr('fill-color') : f_c ? f_c : 'black';
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

function clearSvg(svg_id){
    d3.select("#" + svg_id).selectAll('.datapoint').remove();
    d3.select("#" + svg_id).selectAll('.line').remove();
    d3.select("#" + svg_id).selectAll('.text').remove();
    d3.select("#" + svg_id).selectAll('.axis').remove();
}

function clearSvgTextLines(svg_id){
    d3.select("#" + svg_id).selectAll('.line').remove();
    d3.select("#" + svg_id).selectAll('.text').remove();
    d3.select("#" + svg_id).selectAll('.axis').remove();
}