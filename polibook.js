/*
This program implement WebGL in making a poliline drawing application.
It supports two modes
 */

// TODO extra feature: select color from pallette, upload file in draw mode to make changes,
// TODO ** Extra feature: in draw mode, click q to switch to continuous line mode
// TODO documentation

var gl;
var program;
var points = [];
var colors = [];
var curColor = 'd';  // can be 'b', 'r', 'g', 'b'
var lines = null;

var linesDMdoe = [];
var pointsDMode = [];
var colorsDMode = [];

var mode = 'f';  // default mode is file mode

// HTML element
var canvas;
var paintColorDiv;
var uploadBox;
var brushSize;
var modeTf;

// Variables used in the paint mode
var paintFlag = false;
var isDot = false;
var lastX = 0;
var lastY = 0;
var curX = 0;
var curY = 0;

Array.prototype.insert = function ( index, item ) { // source https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index-javascript
    this.splice( index, 0, item );
};
function render() {  // render points and color

    // create Points GPU buffer
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);  // flatten the points to be 1D data

    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // create Color GPU buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program,  "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    if(points.length == 1) {
        gl.drawArrays(gl.POINTS, 0, points.length);
    }
    else {
        gl.drawArrays(gl.LINE_STRIP, 0, points.length);
    }
}

function renderDMode() {
    // Set clear color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas> by clearning the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    for(let i = 0; i < linesDMdoe.length; i ++) {
        // create Points GPU buffer

        colorsDMode = []
        for (let j = 0; j < linesDMdoe[i].length; j ++) {
            pushToColor(colorsDMode);
        }

        var pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(linesDMdoe[i]), gl.STATIC_DRAW);  // flatten the points to be 1D data

        var vPosition = gl.getAttribLocation(program,  "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // create Color GPU buffer
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsDMode), gl.STATIC_DRAW);

        var vColor = gl.getAttribLocation(program,  "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        var pointSizeLoc = gl.getUniformLocation(program, "vPointSize");
        gl.uniform1f(pointSizeLoc, 5.0);

        if(linesDMdoe[i].length == 1) {
            gl.drawArrays(gl.POINTS, 0, linesDMdoe[i].length);
        }
        else {
            gl.drawArrays(gl.LINE_STRIP, 0, linesDMdoe[i].length);
        }
    }
}

function polibook_draw(lines) {

    // clear everything
    // Set clear color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas> by clearning the color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);
    points = [];
    colors = [];

    for(i = 0; i < lines.length; i ++) {  // continues until the comment ends
        try {
            if(lines[i][0].charAt(0) == '*') {
                break;
                }
        }
        catch(error) {
            if (error instanceof RangeError) {
                console.log("One of the line is empty, check parse filter");
            }
            else {
                console.log(error);
            }
        }
    }
    // end of comment block

    //dino.dat: if there is no comment block
    if(i == lines.length) {
        i = -1;
    }
    console.log(i);
    for(j = i+1; j < lines.length; j ++) {
        var ver_num = 0;
        var cnt = j - i - 1  // how many lines after the commented line have we gone through
        // console.log(cnt + ': ' + lines[j]);

        if(cnt == 0) {
            if (lines[j].length == 4){
                var left = parseFloat(lines[j][0]);
                var top = parseFloat(lines[j][1]);
                var right = parseFloat(lines[j][2]);
                var bottom = parseFloat(lines[j][3]);
            }
            else {
                var left = 0;
                var top = 480;
                var right = 640;
                var bottom = 0;
                cnt = 1;
            }
            //Set up the viewport
            // retain aspect ratio
            let height = top - bottom;
            let width = right - left;

            let min = 0;
            let max = 0;

            if(height > width) {
                min = width;
                max = height;
            }
            else {
                min = height;
                max = width;
            }

            let ratio = min/max;

            gl.viewport( 0, 0, canvas.width, canvas.height * ratio);  // the canvas width and height will update automatically

            var projMatrix = ortho(left, right, bottom, top, -1, 1);
            // ortho(-1, 1, 1, 1)
            var projMatrixLoc = gl.getUniformLocation(program, "projMatrix");
            gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix));

            console.log(left + ' ' + top + ' ' + right + ' ' + bottom);
        }

        if (cnt == 1) {
            var line_num = parseInt(lines[j][0]);
            console.log('Number of polylines is: ' + line_num);

        }
        else {
            if(lines[j].length == 1) {  // this line denotes the number of vertices in this polyline

                // reset the point buffer
                if(points.length != 0) { // draw the line if there is any
                    console.log("drawing line: " + points);

                    render();
                }
                points = [];
                colors = [];

                ver_num = parseInt(lines[j][0]);
                console.log('ver num is: ' + ver_num);
                }
            else if(lines[j].length == 2) {  // this line denotes a vertex
                x = parseFloat(lines[j][0])
                y = parseFloat(lines[j][1])

                points.push(vec4(x, y, 0.0, 1.0));
                pushToColor(colors);


                console.log('Adding point: [' + x + ',' + y + ']')
            }
        }
    }

    if(points.length != 0) { // draw the line if there is any
        console.log("drawing line: " + points);
        render()
    }
    points = [];
    colors = [];

    return 0;
}

function pushToColor(colorList) { // push to colors depending on cur color
    switch (curColor) {
    case 'd':
        colorList.push(vec4(0.0, 0.0, 0.0, 1.0));
        break;
    case 'r':
        colorList.push(vec4(1.0, 0.0, 0.0, 1.0));
        break;
    case 'g':
        colorList.push(vec4(0.0, 1.0, 0.0, 1.0));
        break;
    case 'b':
        colorList.push(vec4(0.0, 0.0, 1.0, 1.0));
        break;
    default:
         colorList.push(vec4(0.0, 0.0, 0.0, 1.0));
}
}

function main()
{
    // setting up reading uploaded file
    const input = document.querySelector('input[type="file"]')
    input.addEventListener('change', function (e) {
        console.log(input.files);
        const reader = new FileReader();

        reader.readAsText(input.files[0]);

        reader.onload = function() {
            lines = reader.result.split('\n').map(function(line) {  // split arguments separated by two white spaces
                return line.split(/(?: | )+/).map(function(element) {  // remove white space from all the elements
                    return element.trim()
                }).filter(function (element) {// remove "" from the list
                    return element != ""
                })
            }).filter(function(line) {  // remove empty lines
                return line.length != 0;
            });

            console.log(lines);

            polibook_draw(lines);

        }
    }, false);


    // Retrieve <canvas> element
	canvas = document.getElementById('webgl');
	// Retrieve <mode text> field
    modeTf = document.getElementById('modeTf')
    // Retrieve <upload file box> field
    uploadBox = document.getElementById('uploadBox');
    // Retrieve <paint dic> field
    paintColorDiv = document.getElementById('paintDiv');
    //
    brushSize = document.getElementById('brushSize');


    // Get the rendering context for WebGL, comes from the libraries, everything we do will be in gl
	gl = WebGLUtils.setupWebGL(canvas);
	
	//Check that the return value is not null.
	if (!gl) 
	{
		console.log('Failed to get the rendering context for WebGL');
		return;
	}
	
	// Initialize shaders
	program = initShaders(gl, "vshader", "fshader");
	gl.useProgram(program);  // use these shaders that we have just created


    let newLine = false;
    window.onkeydown = function(event) {
        if (event.key == "b") {
            // if b is down, break the line in draw mode
            newLine = true;
        }
    }
    window.onkeyup = function(event) {
        if (event.key == "b") {
            // if b is down, break the line in draw mode
            newLine = false;
        }
    }

    canvas.addEventListener("mousedown", function(event) {
        // let x = event.offsetX;
        // let y = event.offsetY;

        console.log("Click at: [" + event.offsetX/canvas.width + "," + event.offsetY/canvas.height + "]")

        // draw the point if we are in the draw mode
        if(mode == 'd') {
            if(newLine || pointsDMode.length >= 100) { // if b key is held down or if the number points exceeds 100
                newLine = false;
                pointsDMode = []; //reset points
            }
            else {
                linesDMdoe.pop();

            }
            pointsDMode.push(vec4(event.offsetX/canvas.width, (canvas.height - event.offsetY)/canvas.height, 0.0, 1.0));
            linesDMdoe.push(pointsDMode);
            // color is dealt in render
            renderDMode();
        }
	    else if(mode == 'p') {
	        processPaint('down', event);
        }
    }, false);

    canvas.addEventListener('mousemove', function(e) {
        processPaint('move', e)
    });
    canvas.addEventListener('mouseup', function(e) {
        processPaint('up', e)
    });
    canvas.addEventListener('mouseout', function(e) {
        processPaint('out', e)
    });

    function processPaint(eventType, e) {
        if(eventType == 'down') {
            lastX = curX;
            lastY = curY;
            curX = e.offsetX/canvas.width;
            curY = e.offsetY/canvas.height;
            console.log("Paint Mode: Click at: [" + e.offsetX/canvas.width + "," + e.offsetY/canvas.height + "]")

            isDot = true;
            paintFlag = true;
            if(isDot) { // paint a dot
                console.log('Painting a Dot');
            }
        }
        else if(eventType == 'out' || eventType == 'up') {
            paintFlag = false;
        }
        else if (eventType == 'move') {
            if (paintFlag) {
                lastX = curX;
                lastY = curY;
                curX = e.offsetX/canvas.width;
                curY = e.offsetY/canvas.height;
            }
        }
    }

    function renderPMode() {

    }

    window.addEventListener("keypress", function(e) {
        console.log('keypress: ' + e.key);
        if(e.key == 'f') {

            console.log("File Mode Enabled");
            mode = 'f';
            file_mode_display();
        }
        else if (e.key == 'd') {
            console.log("Drawing Mode Enabled")
            mode = 'd';

            // set projection matrix for draw mode
            var projMatrix = ortho(0.0, 1.0, 0.0, 1.0, -1, 1);
            var projMatrixLoc = gl.getUniformLocation(program, "projMatrix");
            gl.uniformMatrix4fv(projMatrixLoc, false, flatten(projMatrix));

            // reset points and color
            linesDMdoe = [];
            pointsDMode = [];
            colorsDMode = [];

            draw_mode_display();
        }
        else if (e.key == 'c') {  // color cycles through black, red, green and blue
            if(curColor == 'd') {
                curColor = 'r';
            }
            else if(curColor == 'r') {
                curColor = 'g';
            }
            else if(curColor == 'g') {
                curColor = 'b';
            }
            else if(curColor == 'b') {
                curColor = 'd';
            }

            if(mode == 'f') {
                if(lines) {
                    polibook_draw(lines);
                }
            }
            else if (mode == 'd') {
                if(linesDMdoe) {
                    renderDMode();
                }
            }
        }
        else if (e.key == 'p') {
            gl.viewport(0, 0, canvas.width, canvas.height);
            console.log("Paint Mode Enabled")
            paint_mode_display();
            brushSize.value = 5;
            mode = 'p';
        }

        if(mode == 'p') {  // process brush size
            if(isFinite(e.key)){
                console.log('Number Pressed');

                let brushSizeNum = parseInt(e.key);

                if(brushSizeNum != 0) { // brush size cannot be zero
                    brushSize.value = brushSizeNum;
                }
            }
        }
    }, false);


    function file_mode_display() {
        uploadBox.style.display = "block";  // show the upload file box in file mode
        paintColorDiv.style.display = "none";
        modeTf.innerHTML  = "File Mode";

        // Set clear color
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        // Clear <canvas> by clearning the color buffer
        gl.clear(gl.COLOR_BUFFER_BIT);

    }

    function draw_mode_display() {
        uploadBox.style.display = "none";  // hide the upload file box in drawing mode
        paintColorDiv.style.display = "none";
        modeTf.innerHTML  = "Drawing Mode";

        gl.viewport(0, 0, canvas.width, canvas.height);
        //clear the screen when entering draw mode
        // Set clear color
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        // Clear <canvas> by clearning the color buffer
        gl.clear(gl.COLOR_BUFFER_BIT);

    }

    function paint_mode_display() {
        // Set clear color
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        // Clear <canvas> by clearning the color buffer
        gl.clear(gl.COLOR_BUFFER_BIT);
        uploadBox.style.display = "none";
        paintColorDiv.style.display = "block";
        modeTf.innerHTML  = "Paint Mode";

    }

    //default at file mode
    file_mode_display()
}

