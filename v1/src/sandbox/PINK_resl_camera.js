import ReactDOM from "react-dom";
import React, {Component} from 'react';
import initREGL from 'regl';
import resl from 'resl';
import d3 from 'd3';

import initCamera from 'canvas-orbit-camera';
import mat4 from 'gl-mat4';

// const mat4 = require('gl-mat4') const camera =
// require('canvas-orbit-camera')(canvas)

export default class Sandbox extends Component {

    constructor(props) {
        super(props)
        window.sandbox = this
        this.dataset = 29045011805220233
        fetch("https://storage.googleapis.com/slides.dna-microscopy.org/all_v2/website_datasets" +
                "/ben_coolship_io/winning_segments_grid_29045011805220233.json.gz").then((response) => {
            return response.json()
        }).then((json) => {
            this.passing_segments = json
        })

        this.little_canvas = React.createRef();
        this.resolution = 800;
    }

    componentDidMount() {
        this.little_canvas_dom = ReactDOM.findDOMNode(this.little_canvas.current)
        this.little_canvas_dom.width = this.resolution;
        this.little_canvas_dom.height = this.resolution;

        var regl = initREGL(this.little_canvas_dom);
        var camera = initCamera(this.little_canvas_dom)
        this.drawRegl(regl, camera);

    }

    drawRegl(regl, camera) {

        // geometry arrays.
        const elements = []
        var xzPosition = []

        const N = 64 // num quads of the plane

        var size = 0.5
        var xmin = -size
        var xmax = +size
        var ymin = -size
        var ymax = +size

        // increase and decrease the blur amount by modifying this value.
        const FILTER_RADIUS = 1

        /*
  For the terrain geometry, we create a plane with min position as (x=-0.5,z=-0.5) and max position as (x=+0.5, z=+0.5).
  In the vertex shader, we enlarge this plane on the x- and z-axis. And the y-values are sampled from the heightmap texture,
  The uv-coordinates are computed from the positions.
  The normals can be approximated from the heightmap texture and the positions.
  So we only have to upload the x- and z-values and the heightmap texture to the GPU, and nothing else.
*/
        var row
        var col
        for (row = 0; row <= N; ++row) {
            var z = (row / N) * (ymax - ymin) + ymin
            for (col = 0; col <= N; ++col) {
                var x = (col / N) * (xmax - xmin) + xmin
                xzPosition.push([x, z])
            }
        }

        // create plane faces.
        for (row = 0; row <= (N - 1); ++row) {
            for (col = 0; col <= (N - 1); ++col) {
                var i = row * (N + 1) + col

                var i0 = i + 0
                var i1 = i + 1
                var i2 = i + (N + 1) + 0
                var i3 = i + (N + 1) + 1

                elements.push([i3, i1, i0])
                elements.push([i0, i2, i3])
            }
        }
        console.log(elements)

        const setupDefault = regl({
            cull: {
                enable: true
            },
            uniforms: {
                // View Projection matrices.
                view: () => camera.view(),
                projection: ({viewportWidth, viewportHeight}) => mat4.perspective([], Math.PI / 4, viewportWidth / viewportHeight, 0.01, 3000),

                // light settings. These can of course by tweaked to your likings.
                lightDir: [
                    0.39, 0.87, 0.29
                ],
                ambientLightAmount: 0.3,
                diffuseLightAmount: 0.7
            },
            framebuffer: fbo
        })

        // // configure intial camera view.
        camera.rotate([
            0.0, 0.0
        ], [0.0, -0.4])
        camera.zoom(300.0)

        // create fbo. We set the size in `regl.frame`
        const fbo = regl.framebuffer({
            color: regl.texture({width: 1, height: 1, wrap: 'clamp'}),
            depth: true
        })

        const drawFboBlurred = regl({
            frag: `
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D tex;
  uniform float wRcp, hRcp;
#define R int(${FILTER_RADIUS})
  void main() {
    float W =  float((1 + 2 * R) * (1 + 2 * R));
    vec3 avg = vec3(0.0);
    for (int x = -R; x <= +R; x++) {
      for (int y = -R; y <= +R; y++) {
        avg += (1.0 / W) * texture2D(tex, uv + vec2(float(x) * wRcp, float(y) * hRcp)).xyz;
      }
    }
    gl_FragColor = vec4(avg, 1.0);
  }`,

            vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,
            attributes: {
                position: [
                    -4,
                    -4,
                    4,
                    -4,
                    0,
                    4
                ]
            },
            uniforms: {
                tex: ({count}) => fbo,
                wRcp: ({viewportWidth}) => 1.0 / viewportWidth,
                hRcp: ({viewportHeight}) => 1.0 / viewportHeight
            },
            depth: {
                enable: false
            },
            count: 3
        })
        

        const drawTerrain = regl({
            frag: `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform sampler2D rockTexture;
  uniform vec3 lightDir;
  uniform float ambientLightAmount;
  uniform float diffuseLightAmount;
  void main () {
    vec3 tex = texture2D(rockTexture, vUv*2.0).rgb;
    vec3 ambient = ambientLightAmount * tex;
    vec3 diffuse = diffuseLightAmount * tex * clamp( dot(vNormal, lightDir ), 0.0, 1.0 );
    gl_FragColor = vec4(ambient + diffuse, 1.0);
  }`,
            vert: `
  // the size of the world on the x and z-axes.
#define WORLD_SIZE 300.0
  // the height of the world.
#define WORLD_HEIGHT 100.0
  uniform sampler2D heightTexture;
  float getHeight(vec2 xz) {
    vec2 uv = vec2(0.5, 0.5) + xz.xy;
    return WORLD_HEIGHT*(-1.0 + 2.0 * texture2D(heightTexture, uv).r);
  }
  vec3 getPosition(vec2 xz) {
    return vec3(WORLD_SIZE*xz.x, getHeight(xz), WORLD_SIZE*xz.y);
  }
  precision mediump float;
  attribute vec2 xzPosition;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform mat4 projection, view;
  void main() {
    vec3 xyzPosition = getPosition(xzPosition);
    vec2 uv = vec2(0.5, 0.5) + xzPosition.xy;
    vUv = uv;
    float eps = 1.0/16.0;
    // approximate the normal with central differences.
    vec3 va = vec3(2.0*eps,
                   getHeight(xzPosition + vec2(eps,0.0)) - getHeight(xzPosition - vec2(eps,0.0)) , 0.0 );
    vec3 vb = vec3(0.0,
                   getHeight(xzPosition + vec2(0.0, eps)) - getHeight(xzPosition - vec2(0.0, eps)), 2.0*eps );
    vNormal = normalize(cross(normalize(vb), normalize(va) ));
    vPosition = xyzPosition;
    gl_Position = projection * view * vec4(xyzPosition, 1);
  }`,

            uniforms: {
                heightTexture: regl.prop('heightTexture'),
                rockTexture: regl.prop('rockTexture')
            },
            attributes: {
                xzPosition: regl.prop('xzPosition')
            },
            elements: regl.prop('elements')
        })

        //SAMPLECREATING A TEXTURE FROM A CANVAS

        // var canvas = document.createElement(canvas)
        // var context2D = canvas.getContext('2d')
        // var canvasTexture = regl.texture(canvas)
        // var otherCanvasTexture = regl.texture(context2D)

        // https://github.com/regl-project/regl/blob/master/API.md#texture-constructor


        resl({
            manifest: {
                heightTexture: {
                    type: 'image',
                    src: process.env.PUBLIC_URL + '/textureplane.png',
                    parser: (data) => regl.texture({data: data})
                },
                rockTexture: {
                    type: 'image',
                    src: process.env.PUBLIC_URL + '/rock_texture.png',
                    parser: (data) => regl.texture({data: data, wrap: 'repeat'})
                }
            },

            onDone: ({heightTexture, rockTexture}) => {
              console.log("resl loaded")
                regl.frame(({deltaTime, viewportWidth, viewportHeight}) => {
                    /*
        We need to set the FBO size in `regl.frame`, because the viewport size will change if
        the user resizes the browser window.
        However, note that regl is clever, and will only actually resize the fbo when the
        viewport size actually changes!
       */

                // //  // console.log("rendering frame")
                //     fbo.resize(viewportWidth, viewportHeight)



                regl.clear({
                  color: [
                      .5, .5, 1, 1
                  ],
                  depth: 1
              })

                    // begin render to FBO
                    setupDefault({}, () => {
                        regl.clear({
                            color: [
                                1,0,1,1
                            ],
                            depth: 1
                        })

                        drawTerrain({elements, xzPosition, heightTexture, rockTexture})
                        console.log('drawing terrain')
                    })


                    // // Now render fbo to quad, but also blur it.
                    //drawFboBlurred()

                    camera.tick()

                //regl(drawTerrainSimple)({elements, xzPosition, heightTexture, rockTexture})

                regl(drawDots)({
                  x:[0,.5,.75],
                  y:[0,.5,.75],
                  z:[0,.5,2],
                  r:[0,1,0],
                  g:[1,0,0],
                  b:[0,0,1],
                  a:[1,1,1],
                  rescale:1,
                  pointWidth:10,
                  cx:0,
                  cy:0,
              });

            //   regl.clear({
            //     color: [
            //         0, 1, 0, 1
            //     ],
            //     depth: 1
            // })
            

                })
            }
        })
    }

    render = () => {

        return (
            <div>
                <span>{this.passing_segments
                        ? "LOADED"
                        : "WAITING"}</span>
                <canvas ref={this.little_canvas}></canvas>
            </div>

        )

    }

}


// const drawTerrainSimple={
//     frag: `
// precision mediump float;
// varying vec2 vUv;
// varying vec3 vNormal;
// uniform sampler2D rockTexture;
// uniform vec3 lightDir;
// uniform float ambientLightAmount;
// uniform float diffuseLightAmount;
// void main () {
// vec3 tex = texture2D(rockTexture, vUv*2.0).rgb;
// vec3 ambient = ambientLightAmount * tex;
// vec3 diffuse = diffuseLightAmount * tex * clamp( dot(vNormal, lightDir ), 0.0, 1.0 );
// gl_FragColor = vec4(ambient + diffuse, 1.0);
// }`,
//     vert: `
// // the size of the world on the x and z-axes.
// #define WORLD_SIZE 300.0
// // the height of the world.
// #define WORLD_HEIGHT 100.0
// uniform sampler2D heightTexture;
// float getHeight(vec2 xz) {
// vec2 uv = vec2(0.5, 0.5) + xz.xy;
// return WORLD_HEIGHT*(-1.0 + 2.0 * texture2D(heightTexture, uv).r);
// }
// vec3 getPosition(vec2 xz) {
// return vec3(WORLD_SIZE*xz.x, getHeight(xz), WORLD_SIZE*xz.y);
// }
// precision mediump float;
// attribute vec2 xzPosition;
// varying vec3 vPosition;
// varying vec2 vUv;
// varying vec3 vNormal;
// //uniform mat4 projection, view;
// void main() {
// vec3 xyzPosition = getPosition(xzPosition);
// vec2 uv = vec2(0.5, 0.5) + xzPosition.xy;
// vUv = uv;
// float eps = 1.0/16.0;
// // approximate the normal with central differences.
// vec3 va = vec3(2.0*eps,
//            getHeight(xzPosition + vec2(eps,0.0)) - getHeight(xzPosition - vec2(eps,0.0)) , 0.0 );
// vec3 vb = vec3(0.0,
//            getHeight(xzPosition + vec2(0.0, eps)) - getHeight(xzPosition - vec2(0.0, eps)), 2.0*eps );
// vNormal = normalize(cross(normalize(vb), normalize(va) ));
// vPosition = xyzPosition;
// gl_Position =  vec4(xyzPosition, 1);
// //gl_Position = projection * view * vec4(xyzPosition, 1);
// }`,

//     uniforms: {
//         heightTexture: regl.prop('heightTexture'),
//         rockTexture: regl.prop('rockTexture')
//     },
//     attributes: {
//         xzPosition: regl.prop('xzPosition')
//     },
//     elements: regl.prop('elements')
// }


const drawDots = {
  blend: {
enable: true,
func: {
    srcRGB: 'src alpha',
    srcAlpha: 'src alpha saturate',
    dstRGB: 'one minus src alpha',
    dstAlpha: 'dst alpha',
    // src: 'one',
    // dst: 'one'
},
equation: 'add',
color: [0, 0, 0, 0]
  },

  vert:`precision mediump float;
  attribute float x;
  attribute float y;
  attribute float z;
attribute float r;
attribute float g;
attribute float b;
attribute float a;
  uniform float pointWidth;
  uniform float rescale;
  varying vec4 fragColor;
  attribute vec4 color;
  uniform float data_rescale;
  uniform float cx;
  uniform float cy;

  vec3 normalizeCoords() {
// read in the positions into x and y vars
return vec3(
    2.0*( (x-cx) *  rescale - .5),
  -2.0*(( (y-cy) *  rescale) - .5),
    z
);	
  }
  
  void main () {
gl_PointSize = pointWidth;
gl_Position = vec4(normalizeCoords(), 1);
fragColor=vec4(r, g, b, a);
  }`,
  frag:` precision mediump float;
  varying vec4 fragColor;
  void main () {
float r = 0.0, delta = 0.0;
vec2 cxy = 2.0 * gl_PointCoord - 1.0;
r = dot(cxy, cxy);
if (r > 1.0) {
    discard;
}
gl_FragColor = fragColor;
  }
  `,
  // attributes
  attributes: {
x: function(context, props) {
    return props.x;
},
y: function(context, props) {
    return props.y;
},
z: function(context, props) {
    return props.z;
},
r: function(context, props) {
    return props.r;
},
g: function(context, props) {
    return props.g;
},
b: function(context, props) {
    return props.b;
},
a: function(context, props) {
    return props.a;
},

  },
  uniforms: {
rescale:(context,props)=>props.rescale,
cy:(context,props)=>props.cy,
cx:(context,props)=>props.cx,
pointWidth: (context,props) =>props.pointWidth,
  },
  // vertex count
  count:(context, props)=>props.x.length,
  primitive: 'points'
};

// plotCommand = plotContext({     // Vertex shader (defines "corners") - simple
// as single flat surface plotted     vert: `     precision highp float;
// attribute vec2 uv;     uniform vec2 aspectRatio;     uniform vec4 bounds;
// varying vec2 xy;     void main () {         xy = bounds.xz + (bounds.yw -
// bounds.xz) * (0.5 + 0.5 * uv.xy);         gl_Position = vec4(uv, 0, 1);     }
//     `,     // Fragment shader - (adds colour to the plot) - adding colour map
// and contours     frag: `     #extension GL_OES_standard_derivatives : enable
//    precision highp float;     // From compiled output of
// https://github.com/substack/glsl-colormap     /// viridis is the name of one
// of the colour maps in above package     /// Looks to be defining 9 different
// colours within the spectrum and then perhpas smoothing between them?     vec4
// viridis (float x) {         const float e0 = 0.0;         const vec4 v0 =
// vec4(0.26666666666666666,0.00392156862745098,0.32941176470588235,1);
// const float e1 = 0.13;         const vec4 v1 =
// vec4(0.2784313725490196,0.17254901960784313,0.47843137254901963,1);
// const float e2 = 0.25;         const vec4 v2 =
// vec4(0.23137254901960785,0.3176470588235294,0.5450980392156862,1);
// const float e3 = 0.38;         const vec4 v3 =
// vec4(0.17254901960784313,0.44313725490196076,0.5568627450980392,1);
// const float e4 = 0.5;         const vec4 v4 =
// vec4(0.12941176470588237,0.5647058823529412,0.5529411764705883,1);
// const float e5 = 0.63;         const vec4 v5 =
// vec4(0.15294117647058825,0.6784313725490196,0.5058823529411764,1);
// const float e6 = 0.75;         const vec4 v6 =
// vec4(0.3607843137254902,0.7843137254901961,0.38823529411764707,1);
// const float e7 = 0.88;         const vec4 v7 =
// vec4(0.6666666666666666,0.8627450980392157,0.19607843137254902,1);
// const float e8 = 1.0;         const vec4 v8 =
// vec4(0.9921568627450981,0.9058823529411765,0.1450980392156863,1);
// float a0 = smoothstep(e0,e1,x);         float a1 = smoothstep(e1,e2,x);
//   float a2 = smoothstep(e2,e3,x);         float a3 = smoothstep(e3,e4,x);
//     float a4 = smoothstep(e4,e5,x);         float a5 = smoothstep(e5,e6,x);
//       float a6 = smoothstep(e6,e7,x);         float a7 = smoothstep(e7,e8,x);
//         return max(mix(v0,v1,a0)*step(e0,x)*step(x,e1),
// max(mix(v1,v2,a1)*step(e1,x)*step(x,e2),
// max(mix(v2,v3,a2)*step(e2,x)*step(x,e3),
// max(mix(v3,v4,a3)*step(e3,x)*step(x,e4),
// max(mix(v4,v5,a4)*step(e4,x)*step(x,e5),
// max(mix(v5,v6,a5)*step(e5,x)*step(x,e6),
// max(mix(v6,v7,a6)*step(e6,x)*step(x,e7),mix(v7,v8,a7)*step(e7,x)*step(x,e8)
//       )))))));     }     // From
// https://github.com/rreusser/glsl-solid-wireframe     /// Used to draw the
// contours on the plot     float contourFunction (float parameter, float
// lineWidth, float lineFeather) {         float w1 = lineWidth - lineFeather *
// 0.5;         float d = fwidth(parameter);         float looped = 0.5 -
// abs(mod(parameter, 1.0) - 0.5);         return smoothstep(d * w1, d * (w1 +
// lineFeather), looped);     }     // The booth function - hacked in not
// changed function name     // See:
// https://en.wikipedia.org/wiki/Test_functions_for_optimization     //
// Particular function used to demonstrate the code     float
// goldsteinPriceFunction (float x, float y) {         return ( x + 2.0 * y -
// 7.0 ) * ( x + 2.0 * y - 7.0 ) + ( 2.0 * x + y - 5.0 ) * ( 2.0 * x + y - 5.0
// );     }     varying vec2 xy;     uniform float ncontours;     void main () {
//         // Compute the function value         float f =
// goldsteinPriceFunction(xy.x, xy.y);         // Value ranges, for scaling the
// colors. Known a priori. Not easy to determine in general :(         float
// logGlobalMinimum = log(1.0);         float logViewMaximum = log(4000.0);
//    // The coloring!         float fScaledLog = (log(f) - logGlobalMinimum) /
// (logViewMaximum - logGlobalMinimum);         float contour =
// contourFunction(fScaledLog * ncontours, 1.0, 1.0);         vec4 color =
// viridis(fScaledLog);         // The output color         gl_FragColor =
// vec4(color.rgb * contour, 1);     }     `,     attributes: {         uv: [-4,
// -4, 0, 4, 4, -4]     },     uniforms: {         aspectRatio: ctx => [1,
// ctx.framebufferHeight / ctx.framebufferWidth],         bounds: (ctx, props)
// => [props.bounds.xmin, props.bounds.xmax, props.bounds.ymin,
// props.bounds.ymax],         ncontours: () => ncontours,     },     primitive:
// 'triangles',     count: 3 })