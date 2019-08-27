import ReactDOM from "react-dom";
import React, { Component } from 'react';
import initREGL from 'regl';
import * as d3 from "d3";

import initCamera from 'canvas-orbit-camera';
import mat4 from 'gl-mat4';
const fit = require('canvas-fit')


export default class Sandbox extends Component {

    constructor(props) {
        super(props)
        this.little_canvas = React.createRef();
        this.resolution = 800;

        this.RED_COLOR_3 = [1,.5,.5]
        this.BLUE_COLOR_3 = [0, .5,1]
    }

    componentDidMount() {
        this.little_canvas_dom = ReactDOM.findDOMNode(this.little_canvas.current)
        this.little_canvas_dom.width = this.resolution;
        this.little_canvas_dom.height = this.resolution;

        this.regl = initREGL(this.little_canvas_dom);
        this.camera = initCamera(this.little_canvas_dom);

        window.addEventListener('resize', fit(this.little_canvas_dom), false)

        this.computeRegl();
        this.drawRegl();

    }
    computeRegl() {
        const { cY, cX, width } = this.props;
        var nX = 120
        var nY = 120

        var densities = this.computeDensities({ cX, cY, width, nX, nY, points: this.props.mainPoints });
        var otherDensities = this.props.otherPointsList.map((pset)=>this.computeDensities({cX, cY, width, nX, nY, points: pset }));


        var {otherColors} = this.props;
        
        window.current_densities =densities
        this.currentColorTexture = this.regl.texture({
            data: densities.map((e) =>[e*2, e/2, e/2,e]).flat().map((e)=>e<255?e:255),  // (e>100?(e>200?255:e):0)
            shape: [nX, nY, 4]
        })

        // this.otherColorTextures = otherDensities.map((d,j)=>this.regl.texture({
        //     data: d.map((e) => [0, e*.25, e*2,  e]).flat().map((e)=>e<255?e:255), //(e>100?e:0)
        //     shape: [nX, nY, 4]
        // }))

        this.otherColorTextures = otherDensities.map((d,j)=>this.regl.texture({
            data: d.map((e) => [otherColors[j][0][0]*255, otherColors[j][0][1]*255,  otherColors[j][0][2]*255, e]).flat().map((e)=>e<255?e:255), //(e>100?e:0)
            shape: [nX, nY, 4]
        }))

        this.currentHeightTexture = this.regl.texture({ data: densities, shape: [nX, nY, 1] })
        this.otherHeightTextures = otherDensities.map(d=>this.regl.texture({ data: d.map((e)=>e/2), shape: [nX, nY, 1] }))

        // geometry arrays.
        const elements = []
        const point_elements = []

        var xzPosition = []
        const N = 128  // num quads of the plane
        var size = .5
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
                point_elements.push(i3)
            }
        }

        this.elements = elements
        this.point_elements = point_elements

        this.xzPosition = xzPosition
    }
    drawRegl() {
        const setupDefault = this.regl({
            cull: {
                enable: true
            },
            uniforms: {
                // View Projection matrices.
                view: () => this.camera.view(),
                projection: ({ viewportWidth, viewportHeight }) => mat4.perspective([], Math.PI / 4, viewportWidth / viewportHeight, 0.01, 3000),

                // light settings. These can of course by tweaked to your likings.
                lightDir: [
                    0.39, 0.87, 0.29
                ],
                ambientLightAmount: 0.5,
                diffuseLightAmount: 0.8,
            },
        })

        // // configure intial camera view.
        this.camera.rotate([
            0.0, 0.0
        ], [0.0, -.60])
        this.camera.zoom(300.0)
        const wrappedDrawTerrain = this.regl(unwrappedDrawTerrain(this.regl))
        const wrappedDrawDottyTerrain = this.regl(unwrappedDrawDottyTerrain(this.regl))
        const wrappedDrawDottyTerrain3D = this.regl(unwrappedDrawDottyTerrain3D(this.regl))

        const wrappedDrawDots = this.regl(drawDots(this.regl))

        var frame = 0
        this.regl.frame(() => {
            frame += 1
            setupDefault({}, () => {
                wrappedDrawDottyTerrain({
                    mainPoints:this.props.mainPoints.map(e=>[(e[0] - this.props.cX) / this.props.width,(e[1] - this.props.cY) / this.props.width ]),
                    pointWidth:3,
                    count:this.props.mainPoints.length,
                    
                        // z:this.props.mainPoints.map((e)=>20),
                        r:this.props.mainPoints.map((e)=>this.RED_COLOR_3[0]/2),
                        g:this.props.mainPoints.map((e)=>this.RED_COLOR_3[1]/2),
                        b:this.props.mainPoints.map((e)=>this.RED_COLOR_3[2]/2),
                        a:this.props.mainPoints.map((e)=>1),
                })

                var allpoints = []
                for (var l of this.props.otherPointsList){
                        allpoints = Array.prototype.concat(allpoints, 
                            l.map(e=>[(e[0] - this.props.cX) / this.props.width,(e[1] - this.props.cY) / this.props.width ]))
                }

                window.allpoints = allpoints
                wrappedDrawDottyTerrain({
                    mainPoints:allpoints,
                    pointWidth:3,
                    count:allpoints.length,
                        r:allpoints.map((e)=>this.BLUE_COLOR_3[0]/2),
                        g:allpoints.map((e)=>this.BLUE_COLOR_3[1]/2),
                        b:allpoints.map((e)=>this.BLUE_COLOR_3[2]/2),
                        a:allpoints.map((e)=>.7),
                })

                
            //    var cX_umap = d3.mean(this.props.thisPointsUmap.map(e=>e[0]))
            //    var cY_umap = d3.mean(this.props.thisPointsUmap.map(e=>e[1]))
            //    var std_umap = d3.deviation(this.props.thisPointsUmap.map(e=>e[0]))

            //    window.cX_umap = cX_umap
            //    window.cY_umap = cY_umap
            //    window.std_umap = std_umap

                // var allpoints_umap = []
                // for (var l of this.props.otherUmapCoords){

                //     var mean_z = d3.mean(l.map((e)=>e[2]))
                //     var std_z = d3.deviation(l.map((e)=>e[2]))
                //         allpoints_umap = Array.prototype.concat(allpoints_umap, 
                //             l.map(e=>[(e[0] - cX_umap) / std_umap,(e[1] - cY_umap) / std_umap,(e[2]- mean_z)*(20 / std_z) ]))
                // }

                // var allcolors_umap = []
                // for (var l of this.props.otherColors){
                //     allcolors_umap = Array.prototype.concat(allcolors_umap, 
                //         l.map(e=>[e[0]*255, e[1]*255, e[2] *255]))
           // }

                // window.allpoints_umap = allpoints_umap
                // wrappedDrawDottyTerrain3D({
                //     mainPoints3D:allpoints_umap,
                //     pointWidth:5,
                //     count:allpoints_umap.length,
                //         r:allcolors_umap.map((e)=>255),
                //         g:allcolors_umap.map((e)=>e[1]),
                //         b:allcolors_umap.map((e)=>e[2]),
                //         a:allpoints_umap.map((e)=>1),
                // })



                wrappedDrawTerrain({
                    elements:this.elements, 
                    xzPosition:this.xzPosition, 
                    colorTexture: this.currentColorTexture, heightTexture:this.currentHeightTexture, 
                    textureCenterX: 0 * Math.sin(frame / 75),
                    textureCenterY: 0 * Math.cos(frame / 50)
                })




                for(var i = 0 ; i < this.otherColorTextures.length; i++){
                    wrappedDrawTerrain({
                        elements:this.elements, 
                        xzPosition:this.xzPosition, 
                        colorTexture: this.otherColorTextures[i], heightTexture:this.otherHeightTextures[i], 
                        textureCenterX: 0* Math.sin(frame / (30+ (i % 10))),
                        textureCenterY: 0 * Math.cos(frame / (30+ (i % 10))),
                    })

                }

            })
            this.camera.tick()
        })
    }


    computeDensities = ({ cX, cY, width, nX, nY, points }) => {

        console.log(points.length)
        var gridSize = width / nX
        var h, h2, iqr, xPoints;
        // Use same bandwidth for each dimension
        const kde = (gridPoint) => {
            return d3.mean(points, function (p) { return gaussian(norm(p, gridPoint) / h) }) / h2;
        }

        // Norm of 2D arrays/vectors
        const norm = (v1, v2) => {
            return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
        }

        const gaussian = (x) => {
            // sqrt(2 * PI) is approximately 2.5066
            return Math.exp(-x * x / (.0003) ) / 2.5066;
        }

        // Array of grid cell points. Each point is the center of the grid cell.
        var grid = d3.merge(d3.range(0, nY).map(function (i) {
            return d3.range(0, nX).map(function (j) {
                return [cX - width / 2 + j * gridSize + gridSize / 2,
                cY - width / 2 + i * gridSize + gridSize / 2]
            });
        }));

        var xPoints = points.map(function (d) { return d[0] }).sort(function (a, b) { return a - b });
        var iqr = d3.quantile(xPoints, 0.75) - d3.quantile(xPoints, 0.25);
        var h = 1.06 * Math.min(d3.deviation(xPoints), iqr / 1.34) * Math.pow(points.length, -0.2) * 5; // factor of 3 is mine. Should increase pointspread?
        var h2 = h * h;
        var densities = grid.map(function (point) { return kde(point); });
        var dmax = d3.max(densities)
        densities = densities.map((e) => e / dmax * 255)

        return densities
    }
    shouldComponentUpdate (nextProps, nextState){

        console.log(this.props.cX, nextProps.cX)  
      if((this.props.cX != nextProps.cX) || (this.props.cY != nextProps.cY) ) {
        console.log("needs update", this.props.cX, nextProps.cX)  
        return true
      } else{
          return false
      }
  }
    render = () => {
        if(this.regl){this.computeRegl()};
        return <canvas ref={this.little_canvas}></canvas>
    }
}



const unwrappedDrawTerrain = (regl) => {
    return {

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
                                vec4 ambient = vec4(ambientLightAmount,ambientLightAmount,ambientLightAmount,1) * tex;
                                vec4 diffuse = diffuseLightAmount * tex * clamp( dot(vNormal, lightDir ), 0.0, 1.0 );
                                gl_FragColor = ambient + diffuse;
                            }`,
        vert: `
                            // the size of the world on the x and z-axes.
                            #define WORLD_SIZE 300.0
                            // the height of the world.
                            #define WORLD_HEIGHT 50.0
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
            heightTexture: regl.prop('heightTexture'),
            colorTexture: regl.prop('colorTexture'),
            textureCenterX: regl.prop('textureCenterX'),
            textureCenterY: regl.prop('textureCenterY'),
        },
        attributes: {
            xzPosition: regl.prop('xzPosition')
        },
        elements: regl.prop('elements')
    }
}


const unwrappedDrawDottyTerrain = (regl) => {
    return {

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

        frag: `
                            precision mediump float;
                            varying vec4 fragColor;
                            
                            void main () {
                                // vec4 tex = texture2D(colorTexture, vUv*1.0  - vec2(textureCenterX,textureCenterY)).rgba;
                                // vec4 ambient = vec4(ambientLightAmount,ambientLightAmount,ambientLightAmount,1) * tex;
                                // vec4 diffuse = diffuseLightAmount * tex * clamp( dot(vNormal, lightDir ), 0.0, 1.0 );


                                float r = 0.0, delta = 0.0;
                                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                                r = dot(cxy, cxy);
                                if (r > 1.0) {
                                    discard;
                                }

                                gl_FragColor = fragColor;
                            }`,
        vert: `
                            // the size of the world on the x and z-axes.
                            #define WORLD_SIZE 300.0
                            // the height of the world.
                            #define WORLD_HEIGHT 50.0
                            precision mediump float;
                            attribute vec2 xzPosition;
                            uniform mat4 projection, view;
                            uniform float pointWidth;
                            varying vec4 fragColor;

                            attribute float r;
                            attribute float g;
                            attribute float b;
                            attribute float a;
                    
                            vec3 getPosition(vec2 xz) {
                                return vec3(WORLD_SIZE*xz.x, -50.0 , WORLD_SIZE*xz.y);
                            }
                            void main() {

                                gl_PointSize = pointWidth;
                                fragColor=vec4(r, g, b, a);
                                vec3 xyzPosition = getPosition(xzPosition);
                                gl_Position = projection * view * vec4(xyzPosition, 1);
                            }`,

        uniforms: {
            pointWidth:regl.prop('pointWidth'),
        },
        attributes: {
            xzPosition: regl.prop('mainPoints'),
            r:regl.prop('r'),
            g:regl.prop('g'),
            b:regl.prop('b'),
            a:regl.prop('a'),

        },
        count:regl.prop("count"),
        //elements: regl.prop('pointList'), // not needed... inferred?
    primitive: 'points'

    }
}




const unwrappedDrawDottyTerrain3D = (regl) => {
    return {

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

        frag: `
                            precision mediump float;
                            varying vec4 fragColor;
                            
                            void main () {

                                float r = 0.0, delta = 0.0;
                                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                                r = dot(cxy, cxy);
                                if (r > 1.0) {
                                    discard;
                                }
                                gl_FragColor = fragColor;
                            }`,
        vert: `
                            // the size of the world on the x and z-axes.
                            #define WORLD_SIZE 300.0
                            // the height of the world.
                            #define WORLD_HEIGHT 50.0
                            precision mediump float;
                            attribute vec3 xyzPosition;
                            uniform mat4 projection, view;
                            uniform float pointWidth;
                            varying vec4 fragColor;

                            attribute float r;
                            attribute float g;
                            attribute float b;
                            attribute float a;
                    
     
                            void main() {

                                gl_PointSize = pointWidth;
                                fragColor=vec4(r, g, b, a);
                                gl_Position = projection * view * vec4(xyzPosition, 1);
                            }`,

        uniforms: {
            pointWidth:regl.prop('pointWidth'),
        },
        attributes: {
            xyzPosition: regl.prop('mainPoints3D'),
            r:regl.prop('r'),
            g:regl.prop('g'),
            b:regl.prop('b'),
            a:regl.prop('a'),

        },
        count:regl.prop("count"),
        //elements: regl.prop('pointList'), // not needed... inferred?
    primitive: 'points'

    }
}







const drawDots = (regl) => {
    return {

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

    vert: `precision mediump float;
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
    frag: ` precision mediump float;
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
        x: function (context, props) {
            return props.x;
        },
        y: function (context, props) {
            return props.y;
        },
        z: function (context, props) {
            return props.z;
        },
        r: function (context, props) {
            return props.r;
        },
        g: function (context, props) {
            return props.g;
        },
        b: function (context, props) {
            return props.b;
        },
        a: function (context, props) {
            return props.a;
        },

    },
    uniforms: {
        rescale: (context, props) => props.rescale,
        cy: (context, props) => props.cy,
        cx: (context, props) => props.cx,
        pointWidth: (context, props) => props.pointWidth,
    },
    // vertex count
    count: (context, props) => props.x.length,
    primitive: 'points'
}
}