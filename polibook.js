// TODO Image looks squashed, what's the proper canvas size
// TODO Draw mode and switching between modes

var gl;
var program;
var points = [];
var colors = [];

Array.prototype.insert = function ( index, item ) { // source https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index-javascript
    this.splice( index, 0, item );
};

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

                    gl.drawArrays(gl.LINE_STRIP, 0, points.length);
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
                colors.push(vec4(0.0, 0.0, 0.0, 1.0));

                console.log('Adding point: [' + x + ',' + y + ']')
                }
        }
    }

    if(points.length != 0) { // draw the line if there is any
        console.log("drawing line: " + points);

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

        gl.drawArrays(gl.LINE_STRIP, 0, points.length);
    }
    points = [];
    colors = [];

    return 0;
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
            const lines = reader.result.split('\n').map(function(line) {  // split arguments separated by two white spaces
                return line.split(/(?: | )+/).map(function(element) {  // remove white space from all the elements
                    return element.trim()
                }).filter(function (element) {// remove "" from the list
                    return element != ""
                })
            }).filter(function(line) {  // remove empty lines
                return line.length != 0;
            });
            // in case arguments are separated by one white space instead of two
            // lines.map(function(line) {
            //    line.map(function (element) {
            //             if(element.includes(' ')) {
            //                 console.log('split by white space: ' + element);
            //                 return element.split(' ');
            //             }
            //             else {
            //                 return element;
            //             }
            //        });
            //    console.log('flattened');
            //    return flatten(line);
            //
            // });
            // for(var i = 0; i < lines.length; i ++) {
            //     var argsWithWhiteSpace = [];
            //
            //     for(var j = 0; j < lines[i].length; j ++) {
            //         var a = lines[i][j];
            //         if(lines[i][j].includes(" ")) { // if this element includes single white space
            //             argsWithWhiteSpace.push(lines[i][j]);
            //         }
            //     }
            //
            //     if(argsWithWhiteSpace.length > 0) {
            //         var indexOffset = 0;
            //         for(var k = 0; k < argsWithWhiteSpace.length; k ++) {
            //             var newArgs = argsWithWhiteSpace[k].split(' ');
            //
            //         }
            //     }
            //
            //     console.log('argsWithWhiteSpace' + argsWithWhiteSpace);
            // }

            console.log(lines);

            polibook_draw(lines);

        }
    }, false);


    // Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

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

	//Set up the viewport
    gl.viewport( 0, 0, canvas.width, canvas.height );  // the canvas width and height will update automatically
	
    //Define the positions of our points
    // points.push(vec4(0.5, -0.5, 0.0, 1.0));
    // points.push(vec4(-0.5, -0.5, 0.0, 1.0));
    // points.push(vec4(0.0, 0.5, 0.0, 1.0));

    // create GPU buffer
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);  // flatten the points to be 1D data
    
    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    //Define the point size
    var pSizes = [];
    points.push(10.0);
    points.push(20.0);
    points.push(30.0);
    //
    // var psBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, psBuffer)
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(pSizes), gl.STATIC_DRAW)

    // var vPointSize = gl.getAttribLocation(program,  "vPointSize");
    // gl.vertexAttribPointer(vPointSize, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vPosition);


    //Define the colors of our points
    var colors = [];
    colors.push(vec4(1.0, 0.0, 0.0, 1.0));
    colors.push(vec4(0.0, 1.0, 0.0, 1.0));
    colors.push(vec4(0.0, 0.0, 1.0, 1.0));
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation(program,  "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // var pointSizeLoc = gl.getUniformLocation(program, "vPointSize");
    // gl.uniform1f(pointSizeLoc, 50.0);


	// // Set clear color
	// gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //
	// // Clear <canvas> by clearning the color buffer
	// gl.clear(gl.COLOR_BUFFER_BIT);

}
