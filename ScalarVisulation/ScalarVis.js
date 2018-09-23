var x_extent = [-1.0, 1.0];
var y_extent = [-1.0, 1.0];
var myGrid;

//---------------------------------------------------------------------------
//Main function--------------------------------------------------------------
function main(){
    if (document.getElementById("gaussian").checked){
        render();
    }
    if (document.getElementById("interpolation").checked){
        interpolate();
    }
}

//--Function--render---------------------------------------------------------
//Main drawing function using gaussian---------------------------------------

function render(canvas){
    var res = parseFloat(document.getElementById("grid_res").value);
    myGrid = new UGrid2D([x_extent[0], y_extent[0]], [x_extent[1],y_extent[1]], res);
    var canvas = document.getElementById("example");
    if (! canvas) {
        console.log('Failed to retrieve the < canvas > element');
        return false;
    }
    else {
        console.log('Got < canvas > element ');
    }
    
    //Get the rendering context for 2DCG.
    var ctx = canvas.getContext('2d');
    
    //Draw the scalar data using an image presentation. 
    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    var scalar_func = gaussian;
    
    //Determine the data range... for the color mapping. 
    var mn = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, 0, 0));
    var mx = mn;
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var fval = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y));
            if (fval < mn)
                mn=fval;
            if (fval > mx)
                mx=fval;            
        }
    }
    // Set the colormap based in the radio button.
    var color_func = rainbow_colormap;
    if (document.getElementById("greyscale").checked){
        color_func = greyscale_colormap;
    }
    if (document.getElementById("diverging").checked){
        color_func = diverging_colormap;
    }
    
    
    //Color the domain according to the scalar value. 
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var fval  = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y));
            var color = color_func(fval, mn, mx);
            i = (y*canvas.width + x)*4;
            
            imgData.data[i] = color[0];
            imgData.data[i+1] = color[1];
            imgData.data[i+2] = color[2];
            imgData.data[i+3] = color[3];
        }
        ctx.putImageData(imgData, 0, 0);
        
        if (document.getElementById("show_grid").checked){
            myGrid.draw_grid(canvas);
        }
    }

    //Read multiple iso-values from text box.
    var cons = document.getElementById("contour_values").value.split(" ");
    var contours = [];
    for (var i=0; i<cons.length; i++){
        var m = parseFloat(cons[i]);
        contours.push(m);
    }
    
    //Draw multuple contour lines.
    var deltax = (x_extent[1]-x_extent[0])/res;
    var deltay = (y_extent[1]-y_extent[0])/res;
    for (i=0; i<contours.length;i++){
        for (var j=0; j<res; j++){
            for (var k=0; k<res;k++){
                var p_x = x_extent[0] + deltax*j;
                var p_y = y_extent[0] + deltay*k;
                var fval0 = scalar_func([p_x, p_y]);
                var fval1 = scalar_func([p_x + deltax, p_y]);
                var fval2 = scalar_func([p_x + deltax, p_y + deltay]);
                var fval3 = scalar_func([p_x, p_y + deltay]);
                var m0 = 0;
                var m1 = 0;
                var m2 = 0;
                var m3 = 0;
                if (fval0 < contours[i]){
                    var m0 = 1;
                }
                if (fval1 < contours[i]){
                    var m1 = 1;
                }
                if (fval2 < contours[i]){
                    var m2 = 1;
                }
                if (fval3 < contours[i]){
                    var m3 = 1;
                }
                var ctx = canvas.getContext('2d');
                var sum = 1*m0 + 2*m1 + 4*m2 + 8*m3;
                if (sum == 1 || sum == 14 ){
                    loc=[0,0];
                    var ratiox = (contours[i] - fval0)/(fval1 - fval0);
                    var ratioy = (contours[i] - fval0)/(fval3 - fval0);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox*deltax, p_y);
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 2 || sum == 13){
                    var ratiox = (contours[i] - fval0)/(fval1 - fval0);
                    var ratioy = (contours[i] - fval1)/(fval2 - fval1);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox*deltax, p_y);
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 3 || sum == 12){
                    var ratioy1 = (contours[i] - fval0)/(fval3 - fval0);
                    var ratioy2 = (contours[i] - fval1)/(fval2 - fval1);
                    var point1  = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy1*deltay);
                    var point2  = pt2pixel(canvas.width, canvas.height, x_extent, y_extent,p_x + deltax, p_y + ratioy2*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 4 || sum == 11){
                    var ratiox = (contours[i] - fval3)/(fval2 - fval3);
                    var ratioy = (contours[i] - fval1)/(fval2 - fval1);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox*deltax, p_y + deltay);  
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 5 ){
                    fvalc = (fval0 + fval1 + fval2 + fval3)/4;
                    if (fvalc > contours[i]){
                        var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                        var ratioy1 = (contours[i] - fval0)/(fval3 - fval0);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy1*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        var ratiox2 = (contours[i] - fval3)/(fval2 - fval3);
                        var ratioy2 = (contours[i] - fval1)/(fval2 - fval1);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox2*deltax, p_y + deltay);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy2*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                    }
                    if (fvalc < contours[i]){
                        var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                        var ratioy1 = (contours[i] - fval1)/(fval2 - fval1);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy1*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        var ratiox2 = (contours[i] - fval3)/(fval2 - fval3);
                        var ratioy2 = (contours[i] - fval0)/(fval3 - fval0);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox2*deltax, p_y + deltay); 
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy2*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                    }
                }
                if (sum == 6 || sum == 9){
                    var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                    var ratiox2 = (contours[i] - fval3)/(fval2 - fval3);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y); 
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent,p_x + ratiox2*deltax, p_y+deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 7 || sum == 8){
                    var ratiox = (contours[i] - fval3)/(fval2 - fval3);
                    var ratioy = (contours[i] - fval0)/(fval3 - fval0);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox*deltax, p_y+deltay); 
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x , p_y + ratioy*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 10){
                    fvalc = (fval0 + fval1 + fval2 + fval3)/4;
                    if (fvalc < contours[i]){
                        var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                        var ratioy1 = (contours[i] - fval0)/(fval3 - fval0);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy1*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        var ratiox2 = (contours[i] - fval3)/(fval2 - fval3);
                        var ratioy2 = (contours[i] - fval1)/(fval2 - fval1);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox2*deltax, p_y + deltay); 
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy2*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                    }
                    if (fvalc > contours[i]){
                        var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                        var ratioy1 = (contours[i] - fval1)/(fval2 - fval1);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy1*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        var ratiox2 = (contour[i] - fval3)/(fval2 - fval3);
                        var ratioy2 = (contour[i] - fval0)/(fval3 - fval0);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox2*deltax, p_y + deltay); 
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy2*deltay); 
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                    }
                }
            }
        }
    }
}

//--Function--render---------------------------------------------------------
//Main drawing function using interpolation----------------------------------
function interpolate(canvas){
    var res = parseFloat(document.getElementById("grid_res").value);
    var myGrid = new UGrid2D([x_extent[0], y_extent[0]], [x_extent[1],y_extent[1]], res);
    var canvas = document.getElementById("example");
    if (! canvas) {
        console.log('Failed to retrieve the < canvas > element');
        return false;
    }
    else {
        console.log('Got < canvas > element ');
    }
    
    //Get the rendering context for 2DCG.
    var ctx = canvas.getContext('2d');
    
    //Draw the scalar data using an image presentation. 
    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    var scalar_func = interpolation;
    
    //Determine the data range... for the color mapping. 
    var freq = parseFloat(document.getElementById("sample_freq").value);
    var mn = scalar_func(canvas.width, canvas.height, x_extent, y_extent, 0, 0, freq);
    var mx = mn;
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var fval = scalar_func(canvas.width, canvas.height, x_extent, y_extent, x, y, freq);
            if (fval < mn)
                mn=fval;
            if (fval > mx)
                mx=fval;            
        }
    }
    console.log(mn, mx);
    // Set the colormap based in the radio button.
    var color_func = rainbow_colormap;
    if (document.getElementById("greyscale").checked){
        color_func = greyscale_colormap;
    }
    if (document.getElementById("diverging").checked){
        color_func = diverging_colormap;
    }

    //Color the domain according to the scalar value. 
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var fval  = scalar_func(canvas.width, canvas.height, x_extent, y_extent, x, y, freq);
            var color = color_func(fval, mn, mx);
            i = (y*canvas.width + x)*4;
            
            imgData.data[i] = color[0];
            imgData.data[i+1] = color[1];
            imgData.data[i+2] = color[2];
            imgData.data[i+3] = color[3];
        }
        ctx.putImageData(imgData, 0, 0);
        
        if (document.getElementById("show_grid").checked){
            myGrid.draw_grid(canvas);
        }
    }

    //Read multiple iso-values from text box.
    var cons = document.getElementById("contour_values").value.split(" ");
    var contours = [];
    for (var i=0; i<cons.length; i++){
        var m = parseFloat(cons[i]);
        contours.push(m);
    }
    
    //Draw multuple contour lines.
    var deltax = (x_extent[1]-x_extent[0])/res;
    var deltay = (y_extent[1]-y_extent[0])/res;
    for (i=0; i<contours.length;i++){
        for (var j=0; j<res; j++){
            for (var k=0; k<res;k++){
                var p_x = x_extent[0] + deltax*j;
                var p_y = y_extent[0] + deltay*k;
                var point0 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y);
                var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y);
                var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + deltay);
                var point3 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y+deltay);
                var fval0 = scalar_func(canvas.width, canvas.height, x_extent, y_extent, point0[0], point0[1], freq);
                var fval1 = scalar_func(canvas.width, canvas.height, x_extent, y_extent, point1[0], point1[1], freq);
                var fval2 = scalar_func(canvas.width, canvas.height, x_extent, y_extent, point2[0], point2[1], freq);
                var fval3 = scalar_func(canvas.width, canvas.height, x_extent, y_extent, point3[0], point3[1], freq);
                var m0 = 0;
                var m1 = 0;
                var m2 = 0;
                var m3 = 0;
                if (fval0 < contours[i]){
                    var m0 = 1;
                }
                if (fval1 < contours[i]){
                    var m1 = 1;
                }
                if (fval2 < contours[i]){
                    var m2 = 1;
                }
                if (fval3 < contours[i]){
                    var m3 = 1;
                }
                var ctx = canvas.getContext('2d');
                var sum = 1*m0 + 2*m1 + 4*m2 + 8*m3;
                if (sum == 1 || sum == 14 ){
                    loc=[0,0];
                    var ratiox = (contours[i] - fval0)/(fval1 - fval0);
                    var ratioy = (contours[i] - fval0)/(fval3 - fval0);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox*deltax, p_y);
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 2 || sum == 13){
                    var ratiox = (contours[i] - fval0)/(fval1 - fval0);
                    var ratioy = (contours[i] - fval1)/(fval2 - fval1);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox*deltax, p_y);
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 3 || sum == 12){
                    var ratioy1 = (contours[i] - fval0)/(fval3 - fval0);
                    var ratioy2 = (contours[i] - fval1)/(fval2 - fval1);
                    var point1  = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy1*deltay);
                    var point2  = pt2pixel(canvas.width, canvas.height, x_extent, y_extent,p_x + deltax, p_y + ratioy2*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 4 || sum == 11){
                    var ratiox = (contours[i] - fval3)/(fval2 - fval3);
                    var ratioy = (contours[i] - fval1)/(fval2 - fval1);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox*deltax, p_y + deltay);  
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 5 ){
                    fvalc = (fval0 + fval1 + fval2 + fval3)/4;
                    if (fvalc > contours[i]){
                        var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                        var ratioy1 = (contours[i] - fval0)/(fval3 - fval0);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy1*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        var ratiox2 = (contours[i] - fval3)/(fval2 - fval3);
                        var ratioy2 = (contours[i] - fval1)/(fval2 - fval1);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox2*deltax, p_y + deltay);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy2*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                    }
                    if (fvalc < contours[i]){
                        var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                        var ratioy1 = (contours[i] - fval1)/(fval2 - fval1);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy1*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        var ratiox2 = (contours[i] - fval3)/(fval2 - fval3);
                        var ratioy2 = (contours[i] - fval0)/(fval3 - fval0);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox2*deltax, p_y + deltay); 
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy2*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                    }
                }
                if (sum == 6 || sum == 9){
                    var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                    var ratiox2 = (contours[i] - fval3)/(fval2 - fval3);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y); 
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent,p_x + ratiox2*deltax, p_y+deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 7 || sum == 8){
                    var ratiox = (contours[i] - fval3)/(fval2 - fval3);
                    var ratioy = (contours[i] - fval0)/(fval3 - fval0);
                    var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox*deltax, p_y+deltay); 
                    var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x , p_y + ratioy*deltay);
                    ctx.beginPath();
                    ctx.moveTo(point1[0],point1[1]);
                    ctx.lineTo(point2[0],point2[1]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
                if (sum == 10){
                    fvalc = (fval0 + fval1 + fval2 + fval3)/4;
                    if (fvalc < contours[i]){
                        var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                        var ratioy1 = (contours[i] - fval0)/(fval3 - fval0);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy1*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        var ratiox2 = (contours[i] - fval3)/(fval2 - fval3);
                        var ratioy2 = (contours[i] - fval1)/(fval2 - fval1);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox2*deltax, p_y + deltay); 
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy2*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                    }
                    if (fvalc > contours[i]){
                        var ratiox1 = (contours[i] - fval0)/(fval1 - fval0);
                        var ratioy1 = (contours[i] - fval1)/(fval2 - fval1);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox1*deltax, p_y);
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + deltax, p_y + ratioy1*deltay);
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                        var ratiox2 = (contour[i] - fval3)/(fval2 - fval3);
                        var ratioy2 = (contour[i] - fval0)/(fval3 - fval0);
                        var point1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x + ratiox2*deltax, p_y + deltay); 
                        var point2 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p_x, p_y + ratioy2*deltay); 
                        ctx.beginPath();
                        ctx.moveTo(point1[0],point1[1]);
                        ctx.lineTo(point2[0],point2[1]);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = '#000000';
                        ctx.stroke();
                    }
                }
            }
        }
    }
}

function pixel2pt(width, height, x_extent, y_extent, p_x, p_y){
    var pt = [0,0];
    var xlen = x_extent[1] - x_extent[0];
    var ylen = y_extent[1] - y_extent[0];
    pt[0] = (p_x/width)*xlen + x_extent[0];
    pt[1] = (p_y/height)*ylen + y_extent[0];
    return pt;
}

function pt2pixel(width, height, x_extent, y_extent, p_x, p_y){
    var pt = [0,0];
    var xlen = (p_x - x_extent[0])/(x_extent[1] - x_extent[0]);
    var ylen = (p_y - y_extent[0])/(y_extent[1] - y_extent[0]);
    pt[0]  = Math.round(xlen*width);
    pt[1]  = Math.round(ylen*height);
    return pt;
}