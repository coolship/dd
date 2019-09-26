
import React, {Component, useContext} from 'react';
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

export default class CellDataset3dView extends Component{
    constructor(props){
        super(props)
        this.refs

        this.canvasRef = React.createRef()
        this.selectCanvasRef = React.createRef()

        this.state = {}
        this.state.selected = null;
        this.state.scale=1;
        
    }
    
getCanvasPosition(){
    var curleft = 0, curtop = 0;
    var obj =  ReactDOM.findDOMNode(this.canvasRef.current)

    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}
    getEventLocation(event){
        var element =  ReactDOM.findDOMNode(this.canvasRef.current)
        // Relies on the getElementPosition function.
        var pos = this.getCanvasPosition(element);

        console.log("pos", pos.x, pos.y)
        console.log(event.pageX, event.pageY)
        return {
            x: (event.pageX - pos.x),
              y: (event.pageY - pos.y)
        };
    }

      mouseDown(ev) {
        var eventLocation = this.getEventLocation(ev);
        // var gl = ReactDOM.findDOMNode(this.canvasRef.current).getContext("webgl" ,{preserveDrawingBuffer:true})
        var gl_select = ReactDOM.findDOMNode(this.selectCanvasRef.current).getContext("webgl" ,{preserveDrawingBuffer:true})
        
        console.log(eventLocation)
        var pixels = new Uint8Array(1 * 4);
        
        gl_select.readPixels(eventLocation.x,gl_select.drawingBufferHeight - eventLocation.y, 1, 1, gl_select.RGBA, gl_select.UNSIGNED_BYTE, pixels);
        console.log(pixels)

        var clicked = _.filter(this.props.cell_ds.cells , (c)=>c.rgb[0] == pixels[0] && c.rgb[1]==pixels[1] && c.rgb[2]==pixels[2] )
        // console.log(clicked)
        // console.log(pixels)
        if (clicked.length > 0){
            this.setState({selected:clicked[0].id})
        }
        // var allpixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
        // gl.readPixels(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        //console.log(_.filter(this.props.cell_ds.cells , (c)=>c.rgb[0] == pixels[0] && c.rgb[1]==pixels[1] && c.rgb[2]==pixels[2] ))

      }

    componentDidMount(){
        if( this.canvasRef.current){}
        this.regl =initREGL({
            gl:ReactDOM.findDOMNode(this.canvasRef.current).getContext("webgl" ,{preserveDrawingBuffer:true})
        });
        this.regl_select = initREGL({
            gl:ReactDOM.findDOMNode(this.selectCanvasRef.current).getContext("webgl",{preserveDrawingBuffer:true})
        })
        ReactDOM.findDOMNode(this.canvasRef.current).mousedown =(e)=>{console.log("HI!!!")}
        this.camera = initCamera(ReactDOM.findDOMNode(this.canvasRef.current),{pan:true,rotate:true} );

        // camera.position = [0, 5, 0]
        // camera.target = [0, 0, 0]
        // camera.up = [0, 0, 1]


        this.startAnimation()
    }

    // _handleMouseDown(ev){
    //     if (ev.shiftKey){

    //     }
    // }
    // _handleMove(ev){
    //        // In that case, event.ctrlKey does the trick.

    //     if (ev.shiftKey) {
    //         console.log("shiftkey")
    //         event.stopPropagation();
    //         //this.handleInput(ev);
    //         this.state.x
    //         return false
    //       }
    //       else{
    //           return true
    //       }
    // }
    startAnimation(){
        var viewportWidth=this.props.width;
        var viewportHeight = this.props.height;

        var gl_context = ReactDOM.findDOMNode(this.canvasRef.current).getContext("webgl" ,{preserveDrawingBuffer:true})

        const setupDefault = this.regl({
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
                zLayer:0,
            },
        })

        const setupDefaultSelect= this.regl_select({
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
                zLayer:0,
            },
        })


        var wrappedDrawCells = this.regl(unwrappedDrawCells(this.regl))
        var wrappedDrawCellsSelect = this.regl_select(unwrappedDrawCells(this.regl_select))

        var wrappedCube = this.regl(unwrappedCube(this.regl))
        var wrappedBatchDraw = this.regl(batchDraw(this.regl))


        this.regl_select.frame(()=>{
            setupDefaultSelect({}, () => {

            if(this.props.cell_ds.cells ){
                this.regl_select.clear({
                    color: [0, 0, 0, 1],
                    depth: 1,
                    stencil: 0,
                    

                  })

                wrappedDrawCellsSelect({
                    pointWidth:_.map(this.props.cell_ds.cells, (c)=>c.area12**.5*75),
                    count:Object.keys(this.props.cell_ds.cells).length,
                    xzPosition:_.map(this.props.cell_ds.cells, "xy"),
                    rgb:_.map(this.props.cell_ds.cells, "rgb"),
                    a:_.map(this.props.cell_ds.cells, ()=>1),
                    worldWidth:this.props.width,
                    worldHeight:this.props.height,
                    worldX0: 0,
                    worldY0: 0,
                    rescaleFactor: 1/500 * this.state.scale,
                    zLayer:0,
                    outlineOnly:false,
                })
            }
            })
        })



        this.regl.frame(() => {
            setupDefault({}, () => {

                if(this.props.cell_ds.cells ){
                    this.regl.clear({
                        color: [0, 0, 0, 1],
                        depth: 1,
                        stencil: 0
                      })

                     var  offset_objects = _.map(this.props.cell_ds.cells, (c)=>{
                         return {
                             offset:[c.xy[0],c.xy[1]],
                             color:[c.rgb[0]/ 255,c.rgb[1]/ 255,c.rgb[2]/ 255],
                             worldWidth:this.props.width,
                             worldHeight:this.props.height,
                             worldX0: 0,
                             worldY0: 0,
                             rescaleFactor: 1/500 * this.state.scale,
                             zLayer:.3,
                             cellRadius:c.area12 **.5  * .001,
                             view: this.camera.view(),
                             light: [Math.cos(1 * 0.01) * 10, Math.sin(1 * 0.01) * 10, 5],
                                model: mat4.translate(
                                mat4.identity([]),
                                mat4.scale(mat4.identity([]), mat4.identity([]), [this.state.scale, this.state.scale, this.state.scale]),
                                [1,2,0])
                            }
                        })


                      // This tells regl to execute the command once for each object
                    wrappedBatchDraw(offset_objects)
                    wrappedDrawCells({
                        pointWidth:_.map(this.props.cell_ds.cells, (c)=>c.area12**.5*75),
                        count:Object.keys(this.props.cell_ds.cells).length,
                        xzPosition:_.map(this.props.cell_ds.cells, "xy"),
                        rgb:_.map(this.props.cell_ds.cells, "rgb"),
                        a:_.map(this.props.cell_ds.cells, ()=>.2),
                        worldWidth:this.props.width,
                        worldHeight:this.props.height,
                        worldX0: 0,
                        worldY0: 0,
                        rescaleFactor: 1/500 * this.state.scale,
                        zLayer:0,
                        outlineOnly:false,
                    })
                   if (this.state.selected){
                    wrappedDrawCells({
                        pointWidth:[1000],
                        count:1,
                        xzPosition:[[this.props.cell_ds.cells[this.state.selected].xy]],
                        rgb:[[255,255,255]],
                        a:[1],
                        worldWidth:this.props.width,
                        worldHeight:this.props.height,
                        worldX0: 0,
                        worldY0: 0,
                        rescaleFactor: 1/500 * this.state.scale,
                        outlineOnly:true,
                        zLayer:.1,
                        outlineOnly:true,
                    })
                }


                    // wrappedCube({
                    //     view: this.camera.view(),
                    //     color: [1, 0, 0],
                    //     light: [Math.cos(1 * 0.01) * 10, Math.sin(1 * 0.01) * 10, 5],
                    //     model: mat4.translate(
                    //         mat4.identity([]),
                    //         mat4.scale(mat4.identity([]), mat4.identity([]), [this.state.scale, this.state.scale, this.state.scale]),
                    //         [1,2,0]
                    //     )
                    //   })

                } else {console.log("nope")}
            })
            this.camera.tick()
        })

    }
    render(){
        return (<span><canvas 
            ref = {this.canvasRef}
        className="cell-dataset-3d-view-canvas" 
        width={this.props.width}
        height={this.props.height}
        // onMouseMove={this.mouseMove.bind(this)}
        // onMouseUp={()=>{console.log("CLICK")}}
        onClick={this.mouseDown.bind(this)}
        //onMouseUp={this.mouseUp.bind(this)}
        />
        <canvas 
        style={{
            //pointerEvents:"none",
            //position:"absolute",
            //top:"300px",
            display:"none",
            //visibility:"hidden",
        }}
        
        ref={this.selectCanvasRef}
        width={this.props.width}
        height={this.props.height}/>
        </span>
        )
    }
}


const batchDraw = regl =>{return{

        frag: `
          precision mediump float;
          uniform vec3 color;

          uniform vec3 light;
          varying vec3 vnormal;
          varying vec3 vposition;
          void main() {
            vec3 direction = normalize(light - vposition);
            vec3 normal = normalize(vnormal);
            float power = max(0.0, dot(direction, vnormal));
            gl_FragColor = vec4(mix(vec3(power, power, power), color , 0.7), 1.0);          }`,
      
        vert: `
          precision mediump float;
          attribute vec3 position;
          uniform vec2 offset;
          uniform mat4 projection, view, model;
          attribute vec3 normal;
          varying vec3 vnormal;
          varying vec3 vposition;
          uniform float worldHeight;
          uniform float worldWidth;
          uniform float worldX0;
          uniform float worldY0;
          uniform float rescaleFactor;
          uniform float cellRadius;
          varying vec3 offsetXYZ;
          
    uniform float zLayer; 

    vec3 getOffset(vec2 offsetXY){
        return vec3(worldWidth*(offsetXY.x - worldX0 ) * rescaleFactor, worldHeight*(offsetXY.y - worldY0 ) * rescaleFactor, .02);
    }

    vec3 getRelativePosition(vec3 xyz) {
        return vec3(worldWidth* xyz.x * cellRadius/1.0, 
                    worldHeight* xyz.y * cellRadius/1.0, 
                    worldWidth * xyz.z * cellRadius/1.0);
    }

          void main() {
            vnormal = normal;
            

            offsetXYZ = getOffset(vec2(offset.x, offset.y));


              vec3 xyzPosition = getRelativePosition( position );
              vposition = vec3(xyzPosition);

               

              gl_Position = projection * view * model * vec4(xyzPosition + offsetXYZ, 1);
          }`,


        attributes: {
            position: regl.buffer(mesh.positions),
            normal: regl.buffer(mesh.normals)
          },
          elements: regl.elements(mesh.cells),
          uniforms: {
            cellRadius: regl.prop("cellRadius"),
            worldWidth:regl.prop("worldWidth"),
            worldHeight:regl.prop("worldHeight"),
            worldX0:regl.prop("worldX0"),
            worldY0:regl.prop("worldY0"),
            rescaleFactor:regl.prop("rescaleFactor"),
            zLayer:regl.prop("zLayer"),

            // proj: mat4.perspective([], Math.PI / 2, window.innerWidth / window.innerHeight, 0.01, 1000),
            // model: regl.prop('model'),
            view: regl.prop('view'),
            color: regl.prop('color'),
            light: regl.prop('light'),
            offset: regl.prop('offset'),
            model: regl.prop('model'),

          },

        // uniforms: {
        //   // the batchId parameter gives the index of the command
        //   color: ({tick}, props, batchId) => [
        //     Math.sin(0.02 * ((0.1 + Math.sin(batchId)) * tick + 3.0 * batchId)),
        //     Math.cos(0.02 * (0.02 * tick + 0.1 * batchId)),
        //     Math.sin(0.02 * ((0.3 + Math.cos(2.0 * batchId)) * tick + 0.8 * batchId)),
        //     1
        //   ],

        // offset: regl.prop('offset'),
      
        // depth: {
        //   enable: false
        // },
      
        // count:regl.prop("count"),
      

}}




const unwrappedCube = regl=>{return{
    frag: `
      precision mediump float;
      uniform vec3 color;
      uniform vec3 light;
      varying vec3 vnormal;
      varying vec3 vposition;
      void main () {
        vec3 direction = normalize(light - vposition);
        vec3 normal = normalize(vnormal);
        float power = max(0.0, dot(direction, vnormal));
        gl_FragColor = vec4(mix(vec3(power, power, power), vec3(0.7, 0.1, 0.1), 0.7), 1.0);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 proj;
      uniform mat4 model;
      uniform mat4 view;
      attribute vec3 position;
      attribute vec3 normal;
      varying vec3 vnormal;
      varying vec3 vposition;
      void main () {
        vnormal = normal;
        vposition = position;
        gl_Position = proj * view * model * vec4(position, 1.0);
      }`,
    attributes: {
      position: regl.buffer(mesh.positions),
      normal: regl.buffer(mesh.normals)
    },
    elements: regl.elements(mesh.cells),
    uniforms: {
      //proj: mat4.perspective([], Math.PI / 2, window.innerWidth / window.innerHeight, 0.01, 1000),
      model: regl.prop('model'),
      //view: regl.prop('view'),
      color: regl.prop('color'),
      light: regl.prop('light')
    }
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
        // vec4 tex = texture2D(colorTexture, vUv*1.0  - vec2(textureCenterX,textureCenterY)).rgba;
        // vec4 ambient = vec4(ambientLightAmount,ambientLightAmount,ambientLightAmount,1) * tex;
        // vec4 diffuse = diffuseLightAmount * tex * clamp( dot(vNormal, lightDir ), 0.0, 1.0 );


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
    // the size of the world on the x and z-axes.
    precision mediump float;
    attribute vec2 xzPosition;
    uniform mat4 projection, view;
    attribute float pointWidth;
    varying vec4 fragColor;

    attribute vec3 rgb;
    attribute float a;
    uniform float worldHeight;
    uniform float worldWidth;
    uniform float worldX0;
    uniform float worldY0;
    uniform float rescaleFactor;

    uniform float zLayer; 

    vec3 getPosition(vec2 xz) {
        return vec3(worldWidth*(xz.x - worldX0)*rescaleFactor, worldHeight*(xz.y - worldY0)*rescaleFactor, zLayer);
    }
    void main() {
        gl_PointSize = pointWidth;
        fragColor=vec4(rgb[0]/255.0 , rgb[1]/255.0 ,rgb[2]/255.0 ,a);
        vec3 xyzPosition = getPosition(xzPosition);
        gl_Position = projection * view * vec4(xyzPosition, 1);
    }`,

uniforms: {                   
    worldWidth:regl.prop("worldWidth"),
    worldHeight:regl.prop("worldHeight"),
    worldX0:regl.prop("worldX0"),
    worldY0:regl.prop("worldY0"),
    rescaleFactor:regl.prop("rescaleFactor"),
    zLayer:regl.prop("zLayer"),
    outlineOnly:regl.prop("outlineOnly"),
},
attributes: {
    xzPosition: regl.prop("xzPosition"),
    rgb:regl.prop("rgb"),
    a:regl.prop("a"),
    pointWidth:regl.prop("pointWidth"),

},
count:regl.prop("count"),
//elements: regl.prop('pointList'), // not needed... inferred?
primitive: 'points'
    }
}

