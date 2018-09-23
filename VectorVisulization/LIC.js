var x_extent = [ -1.0, 1.0];
var y_extent = [ -1.0, 1.0];

// Main function
function main(){
    // Color based on the magnitude of the velocity field. 
    if (document.getElementById("color_m_yes").checked){
        color_by_magnitude();
    }
    // Color based on the line integral convolution. 
    else{
        render();
    }
}

// Weight function
function gaussian1D(pt){
    return Math.exp(-(30*pt)*(30*pt));
}

// Gaussian 
function gaussian2D(pt){
    return Math.exp(-(pt[0]*pt[0]+pt[1]*pt[1]));
}

// Calculate gradient of gaussian function at given point 
function gaussian2D_gradient(pt){
    var delta = [0, 0];
    var f = gaussian2D(pt);
    delta[0] = -2*pt[0]*f;
    delta[1] = -2*pt[1]*f;
    return delta;
}

// Convert pixel to point
function pixel2pt(width, height, x_extent, y_extent, p_x, p_y){
    var pt = [0,0];
    var xlen = x_extent[1] - x_extent[0];
    var ylen = y_extent[1] - y_extent[0];
    pt[0] = (p_x/width)*xlen + x_extent[0];
    pt[1] = (p_y/height)*ylen + y_extent[0];
    return pt;
}

// Convert point to pixel
function pt2pixel(width, height, x_extent, y_extent, p_x, p_y){
    var pt = [0,0];
    var xlen = (p_x - x_extent[0])/(x_extent[1] - x_extent[0]);
    var ylen = (p_y - y_extent[0])/(y_extent[1] - y_extent[0]);
    pt[0] = Math.round(xlen*width);
    pt[1] = Math.round(ylen*height);
    return pt;
}

// Rainbow colormap
function rainbow_colormap(fval, fmin, fmax, scale){
    var dx = 0.8;
    var fval_new = (fval - fmin)/(fmax - fmin);
    var g = (6.0 - 2.0*dx)*fval_new + dx;
    var R = Math.max(0.0, (3.0 - Math.abs(g - 4.0) - Math.abs(g - 5.0))/2.0)*255;
    var G = Math.max(0.0, (4.0 - Math.abs(g - 2.0) - Math.abs(g - 4.0))/2.0)*255;
    var B = Math.max(0.0, (3.0 - Math.abs(g - 1.0) - Math.abs(g - 2.0))/2.0)*255;
    color = [Math.round(R)*scale, Math.round(G)*scale, Math.round(B)*scale, 255];
    return color;
}

// Greyscale colormap
function greyscale_colormap(fval, fmin, fmax){
    var c=255*(fval - fmin)/(fmax - fmin);
    var color = [Math.round(c), Math.round(c), Math.round(c), 255];
    return color;
}

// Generate 2D array with random values
function creat2DArray(rows, cols, scale){
    var arr = [];
    for (var i=0; i < rows; i++){
        arr.push([]);
        arr[i].push(new Array(cols));
        for (var j=0; j < cols; j++){
            arr[i][j] = scale * Math.random();
        }
    }
    return arr;
}

// Calculate distance between point 1 & 2
function callength(pt1, pt2){
    return Math.sqrt((pt1[0]-pt2[0])**2 + (pt1[1]-pt2[1])**2);
}

// Draw the hedgehog plot: sample the domain on a uniform grid
var UGrid2D = function(min_corner, max_corner, resolution, factor){
    this.min_corner=min_corner;
    this.max_corner=max_corner;
    this.resolution=resolution;
    this.factor=factor;
    console.log('UGrid2D instance created');
}

UGrid2D.prototype.draw_grid = function(canvas){
    var ctx = canvas.getContext('2d');
    loc = [0, 0];
    delta = canvas.width/this.resolution;
    for (var i=0; i <= this.resolution; i++){
        for (var j=0; j <= this.resolution; j++){
            // To find the position of pixel0 and pixel1 
            var pixel0 = [i*delta, j*delta];
            var pt0 = pixel2pt(canvas.width, canvas.height, x_extent, y_extent, pixel0[0], pixel0[1]);
            var v0 = gaussian2D_gradient(pt0);
            var pt1 = [pt0[0] + v0[0]*this.factor, pt0[1] + v0[1]*this.factor];
            var pixel1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, pt1[0], pt1[1]);
            ctx.beginPath();
            ctx.moveTo(pixel0[0], pixel0[1]);
            ctx.lineTo(pixel1[0], pixel1[1]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#FF0000';
            ctx.stroke();
        }
    }
}

// To implement line integral convolution to get LIC value. 
function lineintegral(pt, width, height, x_extent, y_extent, texture){
    var Lmax = parseFloat(document.getElementById("l_values").value); // LIC line length
    var xmax = width;
    var xmin = 0;
    var ymax = height;
    var ymin = 0;
    var Tmax = 10000;  // maximum euler integration steps
    var h    = 0.001;  // integration step size
    var samplearr = []; // pixels along the streamline
    var lengths   = []; // distances from the source pixel
    
    var pixel = pt2pixel(width, height, x_extent, y_extent, pt[0], pt[1]);
    samplearr.push(pixel);
    var len = callength(pt, pt);
    lengths.push(len);
    
    // forward euler integration along streamline
    var pixel0 = pixel;
    var pt0      = pixel2pt(width, height, x_extent, y_extent, pixel0[0], pixel0[1]);
    for (var i=0; i<Tmax; i++){
        var v_pt0    = gaussian2D_gradient(pt0);
        var v_pt0val = Math.sqrt(v_pt0[0]*v_pt0[0] + v_pt0[1]*v_pt0[1]);
        //if (v_pt0val == 0){
        //    v_pt0[0]     = v_pt0[0]/v_pt0val;
        //    v_pt0[1]     = v_pt0[1]/v_pt0val;
        //}
        var pt2      = [ pt0[0] + h*v_pt0[0], pt0[1] + h*v_pt0[1]];
        var pixel2   = pt2pixel(width, height, x_extent, y_extent, pt2[0], pt2[1]);
        var len      = callength(pt, pt2);
        if ( len < Lmax && xmin < pixel2[0] && pixel2[0] < xmax && ymin < pixel2[1] && pixel2[1] < ymax ){
            samplearr.push(pixel2);
            lengths.push(len);
            pt0 = pt2;
        }
        else{
            break;
        }
    }
    
    // backward euler integration along streamline
    var pixel0   = pixel;
    var pt0      = pixel2pt(width, height, x_extent, y_extent, pixel0[0], pixel0[1]);
    for (var i=0; i<Tmax; i++){
        var v_pt0    = gaussian2D_gradient(pt0);
        var v_pt0val = Math.sqrt(v_pt0[0]*v_pt0[0] + v_pt0[1]*v_pt0[1]);
        //if (v_pt0val == 0){
        //    v_pt0[0]     = v_pt0[0]/v_pt0val;
        //    v_pt0[1]     = v_pt0[1]/v_pt0val;
        //}
        var pt2      = [ pt0[0] - h*v_pt0[0], pt0[1] - h*v_pt0[1]];
        var pixel2   = pt2pixel(width, height, x_extent, y_extent, pt2[0], pt2[1]);
        var len      = callength(pt, pt2);
        if ( len < Lmax && xmin < pixel2[0] && pixel2[0] < xmax && ymin < pixel2[1] && pixel2[1] < ymax ){
            samplearr.push(pixel2);
            lengths.push(len);
            pt0   = pt2;
        }
        else{
            break;
        }
    }
    
    // calculate LIC values
    var sum_weight = 0;
    var sum_lic    = 0;
    for (var i=0; i<lengths.length; i++){
        sum_weight = sum_weight + gaussian1D(lengths[i]);
        point      = samplearr[i];
        sum_lic    = sum_lic + texture[point[0]][point[1]]*gaussian1D(lengths[i]);
    }
    
    return sum_lic/sum_weight;
}

// Color the domain based on LIC values. 
function render(canvas){
    var canvas = document.getElementById("example");
    if (! canvas) {
        console.log('Failed to retrieve the < canvas > element');
        return false;
    }
    else {
        console.log('Got < canvas > element');
    }
    
    var texture = creat2DArray(canvas.width, canvas.height, 10);
    
    //Get the rendering context for 2DCG.
    var ctx = canvas.getContext('2d');
    
    //Draw the scalar data using an image presentation. 
    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    
    //Determine the data range... for the color mapping. 
    var mn = lineintegral([0,0], canvas.width, canvas.height, x_extent, y_extent, texture);
    var mx = mn;
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var pt   = pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y);
            var fval = lineintegral(pt, canvas.width, canvas.height, x_extent, y_extent, texture);
            if (fval < mn)
                mn=fval;
            if (fval > mx)
                mx=fval;            
        }
    }
    
    // Set the colormap based in the radio button.
    var color_func = greyscale_colormap;
    
    //Color the domain according to the scalar value. 
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var pt   = pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y);
            var fval  = lineintegral(pt, canvas.width, canvas.height, x_extent, y_extent, texture);
            var color = color_func(fval, mn, mx);
            var i = (y*canvas.width + x)*4;
            imgData.data[i] = color[0];
            imgData.data[i+1] = color[1];
            imgData.data[i+2] = color[2];
            imgData.data[i+3] = color[3];
        }
        ctx.putImageData(imgData, 0, 0);
    }
    
    // Draw the HedgeHog Plot. 
    loc = [0,0];
    if (document.getElementById("hedge_yes").checked){
        // Sample the domain on a uniform grid
        if (document.getElementById("uniform").checked){
            var res = parseFloat(document.getElementById("grid_res").value);
            var factor = parseFloat(document.getElementById("factor").value);
            myGrid = new UGrid2D([x_extent[0], y_extent[0]], [x_extent[1],y_extent[1]], res, factor);
            myGrid.draw_grid(canvas);
        }
        // Random sample points
        if (document.getElementById("random").checked){
            var res = parseFloat(document.getElementById("num_pts").value);
            var factor = parseFloat(document.getElementById("factor").value);
            for (var i=0; i < res; i++){
                var p0 = [0,0];
                p0[0]  = (Math.random() - 0.5)*2;
                p0[1]  = (Math.random() - 0.5)*2;
                var v0 = gaussian2D_gradient(p0);
                var p1 = [p0[0] + v0[0]*factor, p0[1] + v0[1]*factor];
                var pixel0 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p0[0], p0[1]);
                var pixel1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p1[0], p1[1]);
                ctx.beginPath();
                ctx.moveTo(pixel0[0], pixel0[1]);
                ctx.lineTo(pixel1[0], pixel1[1]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#FF0000';
                ctx.stroke();
            }
        }
    }
}

// Color the domain based on the magnitude of the velocity field. 
function color_by_magnitude(canvas){
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
    
    var texture = creat2DArray(canvas.width, canvas.height, 10);
    
    //Determine the data range... for the color mapping.
    var v0 = gaussian2D_gradient([0,0]);
    var mn = Math.sqrt(v0[0]*v0[0] + v0[1]*v0[1]);
    var mx = mn;
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var pt = pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y);
            var v0 = gaussian2D_gradient(pt);
            var fval = Math.sqrt(v0[0]*v0[0] + v0[1]*v0[1]);
            if (fval < mn)
                mn=fval;
            if (fval > mx)
                mx=fval;            
        }
    }
    
    //Determine the data range... for the color mapping. 
    var mn2 = lineintegral([0,0], canvas.width, canvas.height, x_extent, y_extent, texture);
    var mx2 = mn2;
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var pt   = pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y);
            var fval = lineintegral(pt, canvas.width, canvas.height, x_extent, y_extent, texture);
            if (fval < mn2)
                mn2=fval;
            if (fval > mx2)
                mx2=fval;            
        }
    }
    
    // Set the colormap. 
    var color_func = rainbow_colormap;
    
    // Color the domain according to the scalar value. 
    for (var y=0; y<canvas.height; y++){
        for (var x=0; x<canvas.width; x++){
            var pt = pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y);
            var v0 = gaussian2D_gradient(pt);
            var fval = Math.sqrt(v0[0]*v0[0] + v0[1]*v0[1]);
            var fval2  = lineintegral(pt, canvas.width, canvas.height, x_extent, y_extent, texture);
            var factor = (fval2 - mn2)/(mx2 - mn2);
            // Assign the color, with luminance modulated by the LIC value
            var color  = color_func(fval, mn, mx, factor);
            var i = (y*canvas.width + x)*4;
            imgData.data[i] = color[0];
            imgData.data[i+1] = color[1];
            imgData.data[i+2] = color[2];
            imgData.data[i+3] = color[3];
        }
        ctx.putImageData(imgData, 0, 0);
    }
    
    // Draw the HedgeHog Plot.
    loc = [0,0];
    if (document.getElementById("hedge_yes").checked){
        // Sample the domain on a uniform grid. 
        if (document.getElementById("uniform").checked){
            var res = parseFloat(document.getElementById("grid_res").value);
            var factor = parseFloat(document.getElementById("factor").value);
            myGrid = new UGrid2D([x_extent[0], y_extent[0]], [x_extent[1],y_extent[1]], res, factor);
            myGrid.draw_grid(canvas);
        }
        // Random sample points. 
        if (document.getElementById("random").checked){
            var res = parseFloat(document.getElementById("num_pts").value);
            var factor = parseFloat(document.getElementById("factor").value);
            for (var i=0; i < res; i++){
                var p0 = [0,0];
                p0[0]  = (Math.random() - 0.5)*2;
                p0[1]  = (Math.random() - 0.5)*2;
                var v0 = gaussian2D_gradient(p0);
                var p1 = [p0[0] + v0[0]*factor, p0[1] + v0[1]*factor];
                var pixel0 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p0[0], p0[1]);
                var pixel1 = pt2pixel(canvas.width, canvas.height, x_extent, y_extent, p1[0], p1[1]);
                ctx.beginPath();
                ctx.moveTo(pixel0[0], pixel0[1]);
                ctx.lineTo(pixel1[0], pixel1[1]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#FF0000';
                ctx.stroke();
            }
        }
    }
}
