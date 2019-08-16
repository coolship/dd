import ReactDOM from "react-dom";
import React, {Component} from 'react';
import initREGL from 'regl';
import resl from 'resl';
import * as d3 from "d3";

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
        this.regl = regl
        this.camera = camera

        this.heightTexture2 = this.regl.texture({data:this.densities, shape:[this.nx,this.ny,1]})      
        window.heightTexture2 = this.heightTexture2

        this.rockTexture2 = this.regl.texture({data:this.densities.map((e)=>[e[0],e[0],e[0]]),shape = [this.nx,this.ny,3]})
        window.rockTexture2 = this.rockTexture2

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
        })

        // // configure intial camera view.
        camera.rotate([
            0.0, 0.0
        ], [0.0, -0.4])
        camera.zoom(300.0)

        const drawTerrain = regl({
            frag: `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform sampler2D rockTexture2;
  uniform vec3 lightDir;
  uniform float ambientLightAmount;
  uniform float diffuseLightAmount;
  void main () {
    vec3 tex = texture2D(rockTexture2, vUv*2.0).rgb;
    vec3 ambient = ambientLightAmount * tex;
    vec3 diffuse = diffuseLightAmount * tex * clamp( dot(vNormal, lightDir ), 0.0, 1.0 );
    gl_FragColor = vec4(ambient + diffuse, 1.0);
  }`,
            vert: `
  // the size of the world on the x and z-axes.
#define WORLD_SIZE 300.0
  // the height of the world.
#define WORLD_HEIGHT 100.0
  uniform sampler2D heightTexture2;
  float getHeight(vec2 xz) {
    vec2 uv = vec2(0.5, 0.5) + xz.xy;
    return WORLD_HEIGHT*(-1.0 + 2.0 * texture2D(heightTexture2, uv).r);
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
                heightTexture2: regl.prop('heightTexture2'),
                rockTexture2: regl.prop('rockTexture2')
            },
            attributes: {
                xzPosition: regl.prop('xzPosition')
            },
            elements: regl.prop('elements')
        })

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

                        drawTerrain({elements, xzPosition, heightTexture2:window.heightTexture2, rockTexture2:window.rockTexture2})
                        //console.log('drawing terrain')
                    })

                    // regl.clear({
                    //     color: [1, 0, 0, 1],
                    //     depth: 1
                    //   })

                    // // Now render fbo to quad, but also blur it.


                    camera.tick()

            

                })
            }
        })
    }

    render = () => {

      var width = 100;
      var height = 100;


      var scale = 0.3;
      
      var gridSize = 5;
      this.nx = width / gridSize; 
      this.ny = height/ gridSize;
      

      window.d3 =d3
      window.regl = this.regl
    
      var h, h2, iqr, xPoints;



        // Use same bandwidth for each dimension
        function kde(gridPoint) {
          return d3.mean(xyPoints, function(p) { return gaussian(norm(p, gridPoint) / h) }) / h2;
        }

        // Norm of 2D arrays/vectors
        function norm(v1, v2) {
          return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
        }

        function gaussian(x) {
          // sqrt(2 * PI) is approximately 2.5066
          return Math.exp(-x * x / 2) / 2.5066;
        }

      
      // Array of grid cell points. Each point is the center of the grid cell.
      var grid = d3.merge(d3.range(0, height/gridSize).map(function(i) {
        return d3.range(0, width/gridSize).map(function(j) { return [j*gridSize + gridSize/2, i*gridSize + gridSize/2] });
      }));
      // xyPoints
      window.xyPoints = xyPoints
      var xPoints = xyPoints.map(function(d) { return d[0] }).sort(function(a,b) { return a - b });
      var iqr = d3.quantile(xPoints, 0.75) - d3.quantile(xPoints, 0.25);
      var h = 1.06 * Math.min(d3.deviation(xPoints), iqr / 1.34) * Math.pow(xyPoints.length, -0.2);
      var h2 = h*h;

      window.grid = grid
      var densities = grid.map(function(point) { return kde(point); });
      var dmax = d3.max(densities)
      densities = densities.map((e)=>e/dmax*255)
      window.densities = densities

      this.densities = densities

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

const xyPoints =[[ 78.5,  42.7],
[ 76.5,  55.3],
[ 87.5,  33.3],
[ 84.6,  30.2],
[ 79.4,  41.9],
[ 94.7,  39.1],
[ 70.6,  46.4],
[ 74.7,  30.2],
[ 83.2,  42. ],
[ 68.8,  45.2],
[ 83.4,  35.5],
[ 90.4,  17.3],
[ 82.2,  13.8],
[ 81. ,  42.9],
[ 82.3,  21. ],
[ 90.1,  32.4],
[ 70.9,  46.6],
[ 81.9,  39.2],
[ 77.8,  42.4],
[ 81. ,  46.1],
[ 81.6,  41.9],
[ 79.9,  44.9],
[ 65.8,  47.9],
[ 80.3,  46.8],
[ 79.3,  43.1],
[ 87.9,  40.6],
[ 83.5,  28.5],
[ 80.9,  43.2],
[ 79.3,  44.1],
[ 76. ,  51. ],
[ 73.2,  46.1],
[ 88. ,  18.3],
[100. ,  42.6],
[ 85.3,  41.3],
[ 79.8,  31.5],
[ 79.7,  42.6],
[ 74. ,  45.2],
[ 80.5,  45.7],
[ 75.5,  42.5],
[ 76.1,  50.1],
[ 80.4,  43.2],
[ 78.7,  45.8],
[  0. ,   0. ],
[ 37.9, 100. ],
[ 72.2,  54.6],
[ 81.4,  39.8],
[ 79.7,  43.9],
[ 81.9,  42.6],
[ 77.9,  34. ],
[ 76.8,  51.2],
[ 82.5,  36.5],
[ 72.7,  32.5],
[ 67.5,  37.6],
[ 79.9,  42. ],
[ 70.8,  51.9],
[ 85. ,  20.6],
[ 70.4,  45. ],
[ 74.7,  46.2],
[ 77.1,  53.9],
[ 87.2,  27.8],
[ 81.7,  40.2],
[ 92.1,  14.9],
[ 77.3,  45.6],
[ 90.4,  17. ],
[ 77.8,  53.7],
[ 80. ,  43.2],
[ 80.8,  47.1],
[ 86.4,  41.8],
[ 77.7,  41.3],
[ 75.8,  36.9],
[ 73.6,  45.8],
[ 79.4,  59.2],
[ 80. ,  42.2],
[ 81.2,  43.6],
[ 76.2,  48.3],
[ 76.4,  54.4],
[ 76.4,  49.3],
[ 80.2,  43.4],
[ 79.2,  42.7],
[ 81.4,  43.3],
[ 81.5,  54.4],
[ 81.1,  46.3]]