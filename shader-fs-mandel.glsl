/* Fragment shader that renders Mandelbrot set */
precision mediump float;

/* Width and height of screen in pixels */ 
uniform vec2 u_resolution;

/*position of mouse on display*/

/* Point on the complex plane that will be mapped to the center of the screen */
uniform vec2 u_zoomCenter;

/* Distance between left and right edges of the screen. This essentially specifies
which points on the plane are mapped to left and right edges of the screen.
Together, u_zoomCenter and u_zoomSize determine which piece of the complex
plane is displayed. */
uniform float u_zoomSize;

/* How many iterations to do before deciding that a point is in the set. */
uniform int u_maxIterations;

//c1 is black, c2 is any colour, c3 is white
vec3 colour_picker(float quotient, vec3 c1, vec3 c2, vec3 c3, vec3 c4, vec3 c5, vec3 c6)
{
    float thresh = 0.25;
    if(quotient < thresh)
    {
        return mix(c1, c2, quotient/thresh);
    }
    else if (quotient < thresh*2.0)
    {
        return mix(c2, c3, (quotient - thresh)/thresh);
    }
    else if (quotient < thresh*3.0)
    {
        return mix(c3, c4, (quotient - 2.0*thresh)/thresh);
    }
    else if (quotient < thresh*4.0)
    {
        return mix(c4, c5, (quotient - 3.0*thresh)/thresh);
    }
    else
    {
        return c6;
    }
}


vec2 f(vec2 z, vec2 c) {
    return mat2(z,-z.y,z.x)*z + c;
}

void main() {
vec2 uv = gl_FragCoord.xy / u_resolution;

/* Decide which point on the complex plane this fragment corresponds to.*/
vec2 c = u_zoomCenter + (uv * 4.0 - vec2(2.0)) * (u_zoomSize / 4.0);



/* Now iterate the function. */
vec2 z = vec2(0.0);
bool escaped = false;
int iterations;
for (int i = 0; i < 10000; i++) {
    iterations = i;
    /* Unfortunately, GLES 2 doesn't allow non-constant expressions in loop
    conditions so we have to do this ugly thing instead. */
    if (i > u_maxIterations) break;
    z = f(z, c);
    if (length(z) > 2.0) {
    escaped = true;
    break;
    }
}
    vec3 col = colour_picker(float(iterations) / float(u_maxIterations), vec3(0.1,0.0, 0.1), vec3(0.05, 0.34, 0.93), vec3(0.07, 0.89, 0.12), vec3(0.81,0.89, 0.03 ), vec3(0.9, 0.0, 0.0), vec3(0.0, 0.0, 0.0));
    gl_FragColor = escaped ? vec4(col, 1.0) : vec4(vec3(0.0, 0.0, 0.0), 1.0);
}
