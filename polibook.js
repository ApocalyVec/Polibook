function main() 
{
	// Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL, comes from the libraries, everything we do will be in gl
	var gl = WebGLUtils.setupWebGL(canvas);
	
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
    var points = [];
    points.push(vec4(0.5, -0.5, 0.0, 1.0));
    points.push(vec4(-0.5, -0.5, 0.0, 1.0));
    points.push(vec4(0.0, 0.5, 0.0, 1.0));

    // create GPU buffer
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);  // flatten the points to be 1D data
    
    var vPosition = gl.getAttribLocation(program,  "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);  // we have a flat array
    // at vPosition, every set of 4 values is one vector
    gl.enableVertexAttribArray(vPosition);


    //Define the point size
    // var pSizes = [];
    // points.push(10.0);
    // points.push(20.0);
    // points.push(30.0);
    //
    // var psBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, psBuffer)
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(pSizes), gl.STATIC_DRAW)
    //
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

    var pointSizeLoc = gl.getUniformLocation(program, "vPointSize")
    gl.uniform1f(pointSizeLoc, 50.0)


	// Set clear color
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Clear <canvas> by clearning the color buffer
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Draw a point
	gl.drawArrays(gl.POINTS, 0, points.length);


    window.onkeypress = function(event) {
	    var key = event.key;
	    switch (key) {
            case 'c':
                gl.clear(gl.COLOR_BUFFER_BIT)
                break;
            case 't':
                gl.clear(gl.COLOR_BUFFER_BIT)
                gl.drawArrays(gl.TRIANGLES, 0, points.length);
                break;
            case 'p':
                gl.clear(gl.COLOR_BUFFER_BIT)
                gl.drawArrays(gl.POINTS, 0, points.length);
                break;
        }
    }

    window.onclick = function (event) {
        gl.clear(gl.COLOR_BUFFER_BIT)
    }
}
