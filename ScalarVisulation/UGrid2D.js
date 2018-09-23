var UGrid2D = function(min_corner, max_corner, resolution){
    this.min_corner=min_corner;
    this.max_corner=max_corner;
    this.resolution=resolution;
    console.log('UGrid2D instance created');
}

UGrid2D.prototype.draw_grid = function(canvas){
    var ctx = canvas.getContext('2d');
    loc = [0, 0];
    delta = canvas.width/this.resolution;
    for (var i=0; i <= this.resolution; i++){
        ctx.beginPath();
        ctx.moveTo(i*delta, 0);
        ctx.lineTo(i*delta, canvas.height-1);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
    loc = [0, 0];
    delta = canvas.height/this.resolution;
    for (var i=0; i <= this.resolution; i++){
        ctx.beginPath();
        ctx.moveTo(0, i*delta);
        ctx.lineTo(canvas.width-1, i*delta);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
}
