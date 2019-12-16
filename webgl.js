globalResolution = glMatrix.vec2.create();
glMatrix.vec2.set(globalResolution, 500.0, 500.0); 
globalZoomCenter =  glMatrix.vec2.create();
glMatrix.vec2.set(globalZoomCenter, 0.0, 0.0); 
mousePos =  glMatrix.vec2.create();
globalZoomSize = 2.0;
zoomin = false;
zoomout = false;
zoomvector = glMatrix.vec2.create();
zoomscale = 0.025;
thresh = 0.0;
zoomconst = 0.5;
x_val = 0.0;
y_val = 0.0;


main();

//
// Start here
//
function main() {

  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  x_val = document.getElementById("x-slider").value;
  x_val /= 100;

  y_val = document.getElementById("y-slider").value;
  y_val /= 100;

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  // Vertex shader program

  //get fragment shader
  var juliasource = document.querySelector("#shader-fs-julia").innerHTML;
  var mandelbrotsource = document.querySelector("#shader-fs-mandel").innerHTML;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.compileShader(fragmentShader);
  //get vertex shader
  var vsSource = document.querySelector("#shader-vs").innerHTML;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.compileShader(vertexShader);

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const juliaProgram = initShaderProgram(gl, vsSource, juliasource);
  const mandelbrotProgram = initShaderProgram(gl, vsSource, mandelbrotsource);



  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const juliaprogramInfo = {
    program: juliaProgram,
    attribLocations: {
      coords: gl.getAttribLocation(juliaProgram, 'coords'),
    },
    uniformLocations: {
      resolution: gl.getUniformLocation(juliaProgram, 'u_resolution'),
      zoomSize: gl.getUniformLocation(juliaProgram, 'u_zoomSize'),
      zoomCenter: gl.getUniformLocation(juliaProgram, 'u_zoomCenter'),
      maxIterations: gl.getUniformLocation(juliaProgram, 'u_maxIterations'),
      c: gl.getUniformLocation(juliaProgram, 'u_c')
    },
  };

  const mandelbrotprogramInfo = {
    program: mandelbrotProgram,
    attribLocations: {
      coords: gl.getAttribLocation(mandelbrotProgram, 'coords'),
    },
    uniformLocations: {
      resolution: gl.getUniformLocation(mandelbrotProgram, 'u_resolution'),
      zoomSize: gl.getUniformLocation(mandelbrotProgram, 'u_zoomSize'),
      zoomCenter: gl.getUniformLocation(mandelbrotProgram, 'u_zoomCenter'),
      maxIterations: gl.getUniformLocation(mandelbrotProgram, 'u_maxIterations'),
      c: null
    },
  };

  programInfo = mandelbrotprogramInfo;

  console.log(juliaprogramInfo.uniformLocations.resolution);
  gl.useProgram(mandelbrotProgram);

  gl.uniform2fv(programInfo.uniformLocations.resolution, [500.0, 500.0]);
  gl.uniform2fv(programInfo.uniformLocations.zoomCenter, [0.0, 0.0]);
  gl.uniform1fv(programInfo.uniformLocations.zoomSize, [2.0]);
  gl.uniform1iv(programInfo.uniformLocations.maxIterations, [75]);
  gl.uniform2fv(programInfo.uniformLocations.c, [x_val, y_val]);

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(programInfo.attribLocations.coords, 2 /*components per vertex */, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.coords);
    
  gl.useProgram(programInfo.program);

  // Draw the scene
    function render()
    {
      if(zoomin)
      {
        /* calculate move to center*/
          temp = glMatrix.vec2.create();     
          dist = glMatrix.vec2.distance(globalZoomCenter, mousePos )
          if( dist > thresh)
          {
              glMatrix.vec2.set(temp, zoomvector[0], zoomvector[1]);
              glMatrix.vec2.scale(temp, temp, zoomscale);
              glMatrix.vec2.add(globalZoomCenter, globalZoomCenter,temp );
              //console.log(mousePos[0], mousePos[1]);
              //console.log(globalZoomCenter[0], globalZoomCenter[1]);
              gl.uniform2fv(programInfo.uniformLocations.zoomCenter, globalZoomCenter);
              console.log(thresh);
              globalZoomSize = globalZoomSize - globalZoomSize*0.01;
              gl.uniform1f(programInfo.uniformLocations.zoomSize, globalZoomSize);

          }
          else
          {
            globalZoomSize = globalZoomSize - globalZoomSize*0.01;
            gl.uniform1f(programInfo.uniformLocations.zoomSize, globalZoomSize);
          }
          console.log(globalZoomSize);
          //gl.uniform1i(programInfo.uniformLocations.maxIterations, 500);

      }
      else if(zoomout)
      {
        globalZoomSize = globalZoomSize + globalZoomSize*0.01;
        gl.uniform1f(programInfo.uniformLocations.zoomSize, globalZoomSize);
      }
      else
      {

      }
      console.log("sup");

    //Enter C value.
    document.getElementById("x-slider").oninput = function() {
      x_val = document.getElementById("x-slider").value;
      x_val /= 100;
      document.getElementById("real").value = x_val;
      gl.uniform2fv(programInfo.uniformLocations.c, [x_val, y_val]);
      //console.log(x_val);
    };
    document.getElementById("y-slider").oninput = function() {
      y_val = document.getElementById("y-slider").value;
      y_val /= 100;
      document.getElementById("imaginary").value = y_val;
      gl.uniform2fv(programInfo.uniformLocations.c, [x_val, y_val]);
      //console.log(y_val);
    };
    document.getElementById("max-iterations").oninput = function() {
      maxIterations = document.getElementById("max-iterations").value;
      document.getElementById("max-it").innerHTML = maxIterations;
      gl.uniform1i(programInfo.uniformLocations.maxIterations, [maxIterations]);
      console.log(maxIterations);
    };
    document.getElementById("real").oninput = function() {
      x_val = document.getElementById("real").value;
      gl.uniform2fv(programInfo.uniformLocations.c, [x_val, y_val]);
      console.log("hellox");
    };
    document.getElementById("imaginary").oninput = function() {
      y_val = document.getElementById("imaginary").value;
      gl.uniform2fv(programInfo.uniformLocations.c, [x_val, y_val]);
      console.log("helloy");
    };
    
    document.getElementById("radio-one").oninput = function() {
      programInfo = mandelbrotprogramInfo;
      gl.useProgram(programInfo.program);
      glMatrix.vec2.set(globalResolution, 500.0, 500.0); 
      glMatrix.vec2.set(globalZoomCenter, 0.0, 0.0); 
      globalZoomSize = 2.0;
      zoomscale = 0.025;
      thresh = 0.0;
      zoomconst = 0.5;
      x_val = 0.0;
      y_val = 0.0;
      gl.uniform2fv(programInfo.uniformLocations.resolution, [500.0, 500.0]);
      gl.uniform2fv(programInfo.uniformLocations.zoomCenter, [0.0, 0.0]);
      gl.uniform1fv(programInfo.uniformLocations.zoomSize, [2.0]);
      gl.uniform1iv(programInfo.uniformLocations.maxIterations, [75]);
      };
    document.getElementById("radio-two").oninput = function() {
      programInfo = juliaprogramInfo;
      gl.useProgram(programInfo.program);
      glMatrix.vec2.set(globalResolution, 500.0, 500.0); 
      glMatrix.vec2.set(globalZoomCenter, 0.0, 0.0); 
      globalZoomSize = 2.0;
      zoomscale = 0.025;
      thresh = 0.0;
      zoomconst = 0.5;
      x_val = 0.0;
      y_val = 0.0;
      gl.uniform2fv(programInfo.uniformLocations.resolution, [500.0, 500.0]);
      gl.uniform2fv(programInfo.uniformLocations.zoomCenter, [0.0, 0.0]);
      gl.uniform1fv(programInfo.uniformLocations.zoomSize, [2.0]);
      gl.uniform1iv(programInfo.uniformLocations.maxIterations, [75]);
      gl.uniform2fv(programInfo.uniformLocations.c, [x_val, y_val]); 
    };
    drawScene(gl, programInfo, buffers);
    requestAnimationFrame(render);

    }
    requestAnimationFrame(render);
  
  }

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl) {

  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.

    let array = new Float32Array([-1, 3, -1, -1, 3, -1]);

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
                array,
                gl.DYNAMIC_DRAW);

  return {
    position: positionBuffer,
  };
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers) {
  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



  // Set the shader uniforms

  {
    const offset = 0;
    const vertexCount = 3;
   gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}



function mousedown(event)
{
  console.log("hi");
  if(event.which == 1)
  {
    var x = event.offsetX;
    var y = 500.0 - event.offsetY;
    glMatrix.vec2.set(mousePos, x, y); 
    zoomin = true;
    //console.log("x coords: " + mousePos.x + ", y coords: " + mousePos.y);
    //console.log("x coords: " + globalResolution.x + ", y coords: " + globalResolution.y);

    mousePosToComplexPlane(mousePos, globalResolution);
  }
  else if(event.which == 3)
  {
    zoomout = true;
  }
}

function mouseup(event)
{
    zoomin = false;
    zoomout = false;
}

function mousePosToComplexPlane(mousepos, resolution)
{   
    //calculate mouse position in complex plane
    temp = glMatrix.vec2.create();
    two = glMatrix.vec2.create();
    glMatrix.vec2.set(two, 2.0, 2.0)
    glMatrix.vec2.divide(temp, mousepos, resolution);
    //console.log("x coords: " + temp[0] + ", y coords: " + temp[1]);

    glMatrix.vec2.scale(temp, temp, 4.0);
    glMatrix.vec2.subtract(temp, temp, two);
    glMatrix.vec2.scale(temp, temp, globalZoomSize/4.0);
    glMatrix.vec2.add(temp, globalZoomCenter, temp);
    glMatrix.vec2.set(mousepos,temp[0], temp[1] );

    //create a direction vector from zoom center to mouse pos
    glMatrix.vec2.subtract(temp, temp, globalZoomCenter)
    //console.log("x coords: " + temp[0] + ", y coords: " + temp[1]);
    glMatrix.vec2.set(zoomvector, temp[0], temp[1]);
    thresh = glMatrix.vec2.distance(mousepos, globalZoomCenter)* 0.1;

}



