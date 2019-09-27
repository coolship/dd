import React, { Component, useContext } from 'react';
import initREGL from 'regl';
import ReactDOM from "react-dom"
import initCamera from './OrbitCamera';
import mat4 from 'gl-mat4';
import _ from "lodash"
const fit = require('canvas-fit')
//const normals = require('angle-normals')
//const camera = require('lookat-camera')()
const sphere = require('primitive-icosphere')


var mesh = sphere(2, {
    subdivisions: 1
})

export default class CellDataset3dView extends Component {
    constructor(props) {
        super(props)
        this.refs

        this.canvasRef = React.createRef()
        this.selectCanvasRef = React.createRef()

        this.state = {}
        this.state.selection = null;
        this.state.scale = 1;

    }

    getCanvasPosition() {
        var curleft = 0, curtop = 0;
        var obj = ReactDOM.findDOMNode(this.canvasRef.current)

        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return { x: curleft, y: curtop };
        }
        return undefined;
    }
    getEventLocation(event) {
        var element = ReactDOM.findDOMNode(this.canvasRef.current)
        var pos = this.getCanvasPosition(element);
        return {
            x: (event.pageX - pos.x),
            y: (event.pageY - pos.y)
        };
    }

    mouseDown(ev) {
        var eventLocation = this.getEventLocation(ev);
        var gl_select = ReactDOM.findDOMNode(this.selectCanvasRef.current).getContext("webgl", { preserveDrawingBuffer: true })
        var pixels = new Uint8Array(1 * 4);
        gl_select.readPixels(eventLocation.x, gl_select.drawingBufferHeight - eventLocation.y, 1, 1, gl_select.RGBA, gl_select.UNSIGNED_BYTE, pixels);
        var clicked = _.filter(this.props.cells, (c) => c.rgb[0] == pixels[0] && c.rgb[1] == pixels[1] && c.rgb[2] == pixels[2])
        if (clicked.length > 0) {
            var selection = clicked.map(c=>c.id)
            this.setState({ selection:selection })
            this.props.setSelectionHandler?this.props.setSelectionHandler(selection):null
        } else{
            this.setState({selection:null})
            this.props.setSelectionHandler?this.props.setSelectionHandler(null):null
        }
    }

    componentDidMount() {
        if (this.canvasRef.current) { }
        this.regl = initREGL({
            gl: ReactDOM.findDOMNode(this.canvasRef.current).getContext("webgl", { preserveDrawingBuffer: true })
        });
        this.regl_select = initREGL({
            gl: ReactDOM.findDOMNode(this.selectCanvasRef.current).getContext("webgl", { preserveDrawingBuffer: true })
        })
        ReactDOM.findDOMNode(this.canvasRef.current).mousedown = (e) => { console.log("HI!!!") }
        this.camera = initCamera(ReactDOM.findDOMNode(this.canvasRef.current), { pan: true, rotate: true });
        this.startAnimation()
    }
    startAnimation() {
        var default_uniforms = {
            // View Projection matrices.
            view: () => this.camera.view(),
            projection: ({ viewportWidth, viewportHeight }) => mat4.perspective([], Math.PI / 4, viewportWidth / viewportHeight, 0.01, 3000),
            light: [Math.cos(1 * 0.01) * 10, Math.sin(1 * 0.01) * 10, 5],
            model: mat4.translate(
                mat4.identity([]),
                mat4.scale(mat4.identity([]), mat4.identity([]), [this.state.scale, this.state.scale, this.state.scale]),
                [0, 0, 0]),
            lightDir: [
                0.39, 0.87, 0.29
            ],
            ambientLightAmount: 0.5,
            diffuseLightAmount: 0.8,
            zLayer: 0,
            worldWidth: this.props.width,
            worldHeight: this.props.height,
            worldX0: 0,
            worldY0: 0,
            rescaleFactor: 1 / 500 * this.state.scale,
        }
        const setupDefault = this.regl({ uniforms: default_uniforms })
        const setupDefaultSelect = this.regl_select({ uniforms: default_uniforms })
        var wrappedDrawCells = this.regl(unwrappedDrawCells(this.regl))
        var wrappedDrawCellsSelect = this.regl_select(unwrappedDrawCells(this.regl_select))
        var wrappedBatchDraw = this.regl(batchDraw(this.regl))
        var wrappedDrawHulls = this.regl(unwrappedDrawHulls(this.regl))
        var wrappedDrawUmis = this.regl(unwrappedDrawUmis(this.regl))

        this.regl_select.frame(() => {
            setupDefaultSelect({}, () => {
                if (this.props.cells) {
                    this.regl_select.clear({
                        color: [0, 0, 0, 1],
                        depth: 1,
                        stencil: 0,
                    })
                    wrappedDrawCellsSelect({
                        pointWidth: _.map(this.props.cells, (c) => c.area12 ** .5 * 75),
                        count: Object.keys(this.props.cells).length,
                        xzPosition: _.map(this.props.cells, "xy"),
                        rgb: _.map(this.props.cells, "rgb"),
                        a: _.map(this.props.cells, () => 1),
                        zLayer: 0,
                        outlineOnly: false,
                    })
                }
            })
        })

        this.regl.frame(() => {
            setupDefault({}, () => {
                if (this.props.cells) {
                    this.regl.clear({
                        color: [0, 0, 0, 1],
                        depth: 1,
                        stencil: 0
                    })

                    var offset_objects = _.map(this.props.cells, (c) => {
                        return {
                            offset: [c.xy[0], c.xy[1]],
                            color: [c.rgb[0] / 255, c.rgb[1] / 255, c.rgb[2] / 255],
                            zLayer: .3,
                            cellRadius: c.area12 ** .5 * .001,
                            a:.5
                        }
                    })



                    if (this.props.details) 
                    {

                        wrappedDrawHulls(_.map(this.props.details,c=>({
                            count: c.hull_xy.length-1,
                            xzPosition:c.hull_xy,
                            rgb: c.rgb,
                            a: 1,
                            outlineOnly: false,
                            zLayer: .25,
                            elements:_.range(0,c.hull_xy.length)
                        })))

                        wrappedDrawUmis(_.map(this.props.details,c=>({
                            count: c.points_xy.length,
                            xzPosition:c.points_xy,
                            rgb: c.rgb,
                            a: 1,
                            outlineOnly: false,
                            zLayer: .25,
                        })))
                    }
                    wrappedBatchDraw(offset_objects)
                    wrappedDrawCells({
                        pointWidth: _.map(this.props.cells, (c) => c.area12 ** .5 * 75),
                        count: Object.keys(this.props.cells).length,
                        xzPosition: _.map(this.props.cells, "xy"),
                        rgb: _.map(this.props.cells, "rgb"),
                        a: _.map(this.props.cells, () => .2),
                        zLayer: 0,
                        outlineOnly: false,
                    })
                    
                    

                } else { console.log("nope") }
            })
            this.camera.tick()
        })

    }
    render() {
        return (<span><canvas
            ref={this.canvasRef}
            className="cell-dataset-3d-view-canvas"
            width={this.props.width}
            height={this.props.height}
            onClick={this.mouseDown.bind(this)}
        />
            <canvas
                style={{ display: "none" }}
                ref={this.selectCanvasRef}
                width={this.props.width}
                height={this.props.height} />
        </span>
        )
    }
}


const batchDraw = regl => {
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
        uniform vec3 color;
        
        uniform vec3 light;
        varying vec3 vnormal;
        varying vec3 vposition;
        uniform float a;

        void main() {
            vec3 direction = normalize(light - vposition);
            vec3 normal = normalize(vnormal);
            float power = max(0.0, dot(direction, vnormal));
            gl_FragColor = vec4(mix(vec3(power, power, power), color , 0.7), 1);         
        }`,
        
        vert: `
        precision mediump float;
        attribute vec3 position;
        uniform vec2 offset;
        uniform mat4 projection, view, model;
        attribute vec3 normal;
        varying vec3 vnormal;
        varying vec3 vposition;
        uniform float worldHeight, worldWidth,  worldX0,  worldY0, rescaleFactor;
        uniform float cellRadius;
        varying vec3 offsetXYZ;    
        uniform float zLayer; 
        
        vec3 getPosition(vec2 xz) {
            return vec3(worldWidth*(xz.x - worldX0)*rescaleFactor, worldHeight*(xz.y - worldY0)*rescaleFactor, zLayer);
        }
        
        vec3 getRelativePosition(vec3 xyz) {
            return vec3(worldWidth* xyz.x * cellRadius/1.0, 
                worldHeight* xyz.y * cellRadius/1.0, 
                worldWidth * xyz.z * cellRadius/1.0
                );
            }
            
            void main() {
                vnormal = normal;
                offsetXYZ = getPosition(vec2(offset.x, offset.y));
                vec3 xyzPosition = getRelativePosition( position );
                vposition = vec3(xyzPosition);
                gl_Position = projection * view * model * vec4(xyzPosition *.2 + offsetXYZ, 1);
            }`,
            
            
            attributes: {
                position: regl.buffer(mesh.positions),
                normal: regl.buffer(mesh.normals)
            },
            elements: regl.elements(mesh.cells),
            uniforms: {
                cellRadius: regl.prop("cellRadius"),
                zLayer: regl.prop("zLayer"),
                color: regl.prop('color'),
                offset: regl.prop('offset'),
                a:regl.prop('a'),
                
            },
            
            
            
        }
    }
    
    
    const unwrappedDrawCells = (regl) => {
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
            uniform bool outlineOnly;
            
            void main () {
                float r = 0.0, delta = 0.0;
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                r = dot(cxy, cxy);
                if (r > 1.0) {
                    discard;
                }
                if(outlineOnly){
                    if(r < .9){
                        discard;
                    }
                }
                gl_FragColor = fragColor;
            }`,
            vert: `
            precision mediump float;
            attribute vec2 xzPosition;
            uniform mat4 projection, view, model;
            attribute float pointWidth;
            varying vec4 fragColor;
            attribute vec3 rgb;
            attribute float a;
            uniform float worldHeight, worldWidth,  worldX0,  worldY0, rescaleFactor;
            uniform float zLayer; 
            
            vec3 getPosition(vec2 xz) {
                return vec3(worldWidth*(xz.x - worldX0)*rescaleFactor, worldHeight*(xz.y - worldY0)*rescaleFactor, zLayer);
            }
            void main() {
                gl_PointSize = pointWidth;
                fragColor=vec4(rgb[0]/255.0 , rgb[1]/255.0 ,rgb[2]/255.0 ,a);
                vec3 xyzPosition = getPosition(xzPosition);
                gl_Position = projection * view * model * vec4(xyzPosition, 1);
            }`,
            
            uniforms: {
                zLayer: regl.prop("zLayer"),
                outlineOnly: regl.prop("outlineOnly"),
            },
            attributes: {
                xzPosition: regl.prop("xzPosition"),
                rgb: regl.prop("rgb"),
                a: regl.prop("a"),
                pointWidth: regl.prop("pointWidth"),
                
            },
            count: regl.prop("count"),
            //elements: regl.prop('pointList'), // not needed... inferred?
            primitive: 'points'
        }
    }
    

var lineWidth = 1


        
    
    const unwrappedDrawHulls = (regl) => {
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
            uniform bool outlineOnly;
            uniform vec3 rgb;
            uniform float a;
            
            void main () {
                gl_FragColor = vec4(rgb[0]/255.0 , rgb[1]/255.0 ,rgb[2]/255.0 ,a);
            }`,
            vert: `
            precision mediump float;
            attribute vec2 xzPosition;
            uniform mat4 projection, view, model;
            uniform float worldHeight, worldWidth,  worldX0,  worldY0, rescaleFactor;
            uniform float zLayer; 
 
            
            vec3 getPosition(vec2 xz) {
                return vec3(worldWidth*(xz.x - worldX0)*rescaleFactor, worldHeight*(xz.y - worldY0)*rescaleFactor, zLayer);
            }
            void main() {
                gl_PointSize = 2.0;
                vec3 xyzPosition = getPosition(xzPosition);
                gl_Position = projection * view * model * vec4(xyzPosition, 1);
            }`,
            
            uniforms: {
                zLayer: regl.prop("zLayer"),
                outlineOnly: regl.prop("outlineOnly"),
                rgb: regl.prop("rgb"),
                a: regl.prop("a"),
               
            },
            attributes: {
                xzPosition: regl.prop("xzPosition"),

                
            },
            lineWidth:lineWidth,
            count: regl.prop("count"),
            primitive: 'line loop',
            elements: regl.prop("elements"),
        }
    }
    



        
    
    const unwrappedDrawUmis = (regl) => {
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
            uniform bool outlineOnly;
            uniform vec3 rgb;
            uniform float a;
            
            void main () {
                gl_FragColor = vec4(rgb[0]/255.0 , rgb[1]/255.0 ,rgb[2]/255.0 ,a);
            }`,
            vert: `
            precision mediump float;
            attribute vec2 xzPosition;
            uniform mat4 projection, view, model;
            uniform float worldHeight, worldWidth,  worldX0,  worldY0, rescaleFactor;
            uniform float zLayer; 
 
            
            vec3 getPosition(vec2 xz) {
                return vec3(worldWidth*(xz.x - worldX0)*rescaleFactor, worldHeight*(xz.y - worldY0)*rescaleFactor, zLayer);
            }
            void main() {
                gl_PointSize = 2.0;
                vec3 xyzPosition = getPosition(xzPosition);
                gl_Position = projection * view * model * vec4(xyzPosition, 1);
            }`,
            
            uniforms: {
                zLayer: regl.prop("zLayer"),
                outlineOnly: regl.prop("outlineOnly"),
                rgb: regl.prop("rgb"),
                a: regl.prop("a"),
               
            },
            attributes: {
                xzPosition: regl.prop("xzPosition"),

                
            },
            count: regl.prop("count"),
            primitive: 'points',
        }
    }
    
