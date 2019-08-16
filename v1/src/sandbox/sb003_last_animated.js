import ReactDOM from "react-dom";
import React, {Component} from 'react';
import initREGL from 'regl';
import * as d3 from "d3";

import initCamera from 'canvas-orbit-camera';
import mat4 from 'gl-mat4';

// const mat4 = require('gl-mat4') const camera =
// require('canvas-orbit-camera')(canvas)

export default class Sandbox extends Component {
    
    constructor(props) {
        super(props)
        this.little_canvas = React.createRef();
        this.resolution = 800;
    }
    
    componentDidMount() {
        this.little_canvas_dom = ReactDOM.findDOMNode(this.little_canvas.current)
        this.little_canvas_dom.width = this.resolution;
        this.little_canvas_dom.height = this.resolution;
        
        this.regl = initREGL(this.little_canvas_dom);
        this.camera = initCamera(this.little_canvas_dom)
        this.drawRegl();
        
        
    }
    
    drawRegl() {
        const {cY,cX,width} = this.props;
        var nX=20
        var nY=20
        const x0 = cX - width / 2
        const x1 = cX + width / 2
        const y0 = cY - width / 2
        const y1 = cY + width / 2
        const gridSize = width / nX

        var densities = this.computeDensities({cX, cY, width, nX, nY});
        
     
        //window.densities2 = this.densities.map((e)=>[e[0],e[0],e[0]])
        var colorTexture1 = this.regl.texture({data:densities.map((e)=>[e,0*e,e*.5+100,e*.5+120]).flat(),
            shape: [nX,nY,4]})
            
            var colorTexture2 = this.regl.texture({data:densities.map((e)=>[0*e,e,e*.5+100,e*.5+120]).flat(),
                shape: [nX,nY,4]})
                
                //throw "HI"
                var heightTexture = this.regl.texture({data:densities, shape:[nX,nY,1]})      
                
                
                // geometry arrays.
                const elements = []
                var xzPosition = []
                const N = 32// num quads of the plane
                var size = 1.0
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
                    var z = (row / N) * (ymax - ymin) + (ymin)
                    for (col = 0; col <= N; ++col) {
                        var x = (col / N) * (xmax - xmin) + (xmin)
                        xzPosition.push([x, z])
                    }
                }
                
                var randomX = Math.random() *1.5 - .75
                var randomY = Math.random() *1.5 - .75
                var xzPosition1 = xzPosition.map((e)=>[e[0]+randomX,e[1]+randomY])
                
                var randomX2 = Math.random() *1.5 - .75
                var randomY2 = Math.random() *1.5 - .75
                var xzPosition2 = xzPosition.map((e)=>[e[0]+randomX2,e[1]+randomY2])
                
                
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
                
                const setupDefault = this.regl({
                    cull: {
                        enable: true
                    },
                    uniforms: {
                        // View Projection matrices.
                        view: () => this.camera.view(),
                        projection: ({viewportWidth, viewportHeight}) => mat4.perspective([], Math.PI / 4, viewportWidth / viewportHeight, 0.01, 3000),
                        
                        // light settings. These can of course by tweaked to your likings.
                        lightDir: [
                            0.39, 0.87, 0.29
                        ],
                        ambientLightAmount: 0.5,
                        diffuseLightAmount: 0.7,
                    },
                })
                
                // // configure intial camera view.
                this.camera.rotate([
                    0.0, 0.0
                ], [0.0, -0.4])
                this.camera.zoom(2000.0)
                
                const drawTerrain = this.regl({
                    frag: `
                    precision mediump float;
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    uniform sampler2D colorTexture;
                    uniform vec3 lightDir;
                    uniform float ambientLightAmount;
                    uniform float diffuseLightAmount;
                    uniform float textureCenterX;
                    uniform float textureCenterY;
                    
                    
                    void main () {
                        vec4 tex = texture2D(colorTexture, vUv*1.0  - vec2(textureCenterX,textureCenterY)).rgba;
                        vec4 ambient = ambientLightAmount * tex;
                        vec4 diffuse = diffuseLightAmount * tex * clamp( dot(vNormal, lightDir ), 0.0, 1.0 );
                        gl_FragColor = ambient + diffuse;
                    }`,
                    vert: `
                    // the size of the world on the x and z-axes.
                    #define WORLD_SIZE 300.0
                    // the height of the world.
                    #define WORLD_HEIGHT 100.0
                    uniform sampler2D heightTexture;
                    
                    precision mediump float;
                    attribute vec2 xzPosition;
                    varying vec3 vPosition;
                    varying vec2 vUv;
                    varying vec3 vNormal;
                    uniform mat4 projection, view;
                    
                    uniform float textureCenterX;
                    uniform float textureCenterY;
                    
                    
                    float getHeight(vec2 xz) {
                        vec2 uv = vec2(0.5, 0.5) + xz.xy;
                        return WORLD_HEIGHT*(-1.0 + 2.0 * texture2D(heightTexture, uv- vec2(textureCenterX,textureCenterY)).r);
                    }
                    vec3 getPosition(vec2 xz) {
                        return vec3(WORLD_SIZE*xz.x, getHeight(xz), WORLD_SIZE*xz.y);
                    }
                    void main() {
                        vec3 xyzPosition = getPosition(xzPosition);
                        
                        vec2 uv = vec2(0.5, 0.5) + xzPosition.xy;
                        vUv = uv;
                        float eps = 1.0/16.0;
                        // approximate the normal with central differences.
                        vec3 va = vec3(2.0*eps, getHeight(xzPosition + vec2(eps,0.0)) - getHeight(xzPosition - vec2(eps,0.0)) , 0.0 );
                        vec3 vb = vec3(0.0,getHeight(xzPosition + vec2(0.0, eps)) - getHeight(xzPosition - vec2(0.0, eps)), 2.0*eps );
                        
                        vNormal = normalize(cross(normalize(vb), normalize(va) ));
                        vPosition = xyzPosition;
                        gl_Position = projection * view * vec4(xyzPosition, 1);
                    }`,
                    
                    uniforms: {
                        heightTexture: this.regl.prop('heightTexture'),
                        colorTexture:  this.regl.prop('colorTexture'),
                        textureCenterX:  this.regl.prop('textureCenterX'),
                        textureCenterY:  this.regl.prop('textureCenterY'),
                    },
                    attributes: {
                        xzPosition: this.regl.prop('xzPosition')
                    },
                    elements: this.regl.prop('elements')
                })
                
                var frame = 0
                this.regl.frame(({deltaTime, viewportWidth, viewportHeight}) => {
                    frame+=1
                    setupDefault({}, () => {
                        drawTerrain({elements,xzPosition: xzPosition1, colorTexture:colorTexture1, heightTexture,frame,
                            textureCenterX:randomX *Math.sin(frame/75),textureCenterY:randomY *Math.cos(frame/50)})
                            drawTerrain({elements,xzPosition: xzPosition2, colorTexture:colorTexture2, heightTexture,frame,
                                textureCenterX:randomX2 *Math.sin(frame/75),textureCenterY:randomY2 *Math.cos(frame/150)})
                                
                            })
                            this.camera.tick() 
                        })
                    }
                    
                    
                    computeDensities = ({ cX, cY, width,nX,nY})=>{
                        
                        var gridSize = width / nX 

                        var h, h2, iqr, xPoints;
                        // Use same bandwidth for each dimension
                        
                        const kde = (gridPoint)=>{
                            return d3.mean(this.props.xyPoints, function(p) { return gaussian(norm(p, gridPoint) / h) }) / h2;
                        }
                        
                        // Norm of 2D arrays/vectors
                        const norm = (v1, v2) =>{
                            return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
                        }
                        
                        const gaussian = (x) =>{
                            // sqrt(2 * PI) is approximately 2.5066
                            return Math.exp(-x * x / 2) / 2.5066;
                        }
                        
                        
                        
                        // Array of grid cell points. Each point is the center of the grid cell.
                        var grid = d3.merge(d3.range(0, nY).map(function(i) {
                            return d3.range(0, nX).map(function(j) { return [cX - width/2 + j*gridSize + gridSize/2, 
                                cY - width/2+ i*gridSize + gridSize/2] });
                        }));
                        // xyPoints
                        var xPoints = this.props.xyPoints.map(function(d) { return d[0] }).sort(function(a,b) { return a - b });
                        var iqr = d3.quantile(xPoints, 0.75) - d3.quantile(xPoints, 0.25);
                        var h = 1.06 * Math.min(d3.deviation(xPoints), iqr / 1.34) * Math.pow(this.props.xyPoints.length, -0.2) * 5; // factor of 3 is mine. Should increase pointspread?
                        var h2 = h*h;
                        var densities = grid.map(function(point) { return kde(point); });
                        var dmax = d3.max(densities)
                        densities = densities.map((e)=>e/dmax*255)
                        
                        return densities
                    }
                    
                    render = () => {
                        
                        
                        return (
          
                                <canvas ref={this.little_canvas}></canvas>
                                
                                )
                                
                            }
                            
                        }
                        
