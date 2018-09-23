function gaussian(pt){
    return Math.exp(-(pt[0]*pt[0]+pt[1]*pt[1]));
}

function interpolation(width, height, x_extent, y_extent, p_x, p_y, freq){
    var p1 = [freq*Math.floor(p_x/freq), freq*Math.floor(p_y/freq)];
    var p2 = [freq*Math.floor(p_x/freq) + freq, freq*Math.floor(p_y/freq)];
    var p3 = [freq*Math.floor(p_x/freq) + freq, freq*Math.floor(p_y/freq) + freq];
    var p4 = [freq*Math.floor(p_x/freq), freq*Math.floor(p_y/freq) + freq];
    var fval1 = gaussian(pixel2pt(width, height, x_extent, y_extent, p1[0], p1[1]));
    var fval2 = gaussian(pixel2pt(width, height, x_extent, y_extent, p2[0], p2[1]));
    var fval3 = gaussian(pixel2pt(width, height, x_extent, y_extent, p3[0], p3[1]));
    var fval4 = gaussian(pixel2pt(width, height, x_extent, y_extent, p4[0], p4[1]));
    var fval5 = (Math.abs(p2[0] - p_x)/freq)*fval1 + (Math.abs(p_x - p1[0])/freq)*fval2;
    var fval6 = (Math.abs(p3[0] - p_x)/freq)*fval4 + (Math.abs(p_x - p4[0])/freq)*fval3;
    var fval  = (Math.abs(p_y - p4[1])/freq)*fval5 + (Math.abs(p1[1] - p_y)/freq)*fval6;
    return fval;
}

function pixel2pt(width, height, x_extent, y_extent, p_x, p_y){
    var pt = [0,0];
    var xlen = x_extent[1] - x_extent[0];
    var ylen = y_extent[1] - y_extent[0];
    pt[0] = (p_x/width)*xlen + x_extent[0];
    pt[1] = (p_y/height)*ylen + y_extent[0];
    return pt;
}


function rainbow_colormap(fval, fmin, fmax){
    var dx = 0.8;
    var fval_new = (fval - fmin)/(fmax - fmin);
    var g = (6.0 - 2.0*dx)*fval_new + dx;
    var R = Math.max(0.0, (3.0 - Math.abs(g - 4.0) - Math.abs(g - 5.0))/2.0)*255;
    var G = Math.max(0.0, (4.0 - Math.abs(g - 2.0) - Math.abs(g - 4.0))/2.0)*255;
    var B = Math.max(0.0, (3.0 - Math.abs(g - 1.0) - Math.abs(g - 2.0))/2.0)*255;
    color = [Math.round(R), Math.round(G), Math.round(B), 255];
    return color;
}

function greyscale_colormap(fval, fmin, fmax){
    var c=255*(fval - fmin)/(fmax - fmin);
    var color = [Math.round(c), Math.round(c), Math.round(c), 255];
    return color;
}

function diverging_colormap(fval, fmin, fmax){
    var c=255*(fval - fmin)/(fmax - fmin);
    var color = [255-Math.round(c), Math.round(c), 255-Math.round(c), 255];
    return color;
}
