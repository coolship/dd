import React, {Component} from "react";
import styled from "styled-components";
import {connect} from "react-redux";
import JupyterLauncher from "./JupyterLauncher"
import {setSelectionTime} from "../actions";
import Close from "react-icons/lib/md/close";
import _ from 'lodash';

let querycounter = 0;
class UmiQuery extends Component {
constructor(props){
  super(props)
}
  render(){
    const props = this.props
    const ps = props.query_pagesize
    const is_paged = props.query_result.length > ps

  return (

    <span className="query-info"><span className="query-count">Showing {Math.min(props.query_pagesize,props.query_result.length)} {is_paged?<span> of {props.query_result.length}</span>:""} </span> 
    <span>UMIs with</span><span className="query-type"> {props.query_description} </span> 
    <span className={"query-term "+"color-"+props.query_order}> {props.query_term}.</span> 
    {is_paged?<span class="button" onClick={this.props.nextPage}>[NEXT 50000]</span>:""} 
    {is_paged?<span class="button" onClick={this.props.showAll}>[SHOW ALL]</span>:""} </span>
  )
  }
}

const PendingQuery = (props)=>(
  <span className="query-info"><span>Running query for UMIs with</span><span className="query-type"> {props.query_description} </span> 
  <span className={"query-term "+"color-"+props.query_order}> {props.query_val}</span><div class="loading"></div></span>
)
// 
const withQueryManager = (WrappedComponent)=> {
    return connect(({}) => {
        return {};
    }, {setSelectionTime})(class extends Component { 
    constructor(props){
        super(props)
        this.querycounter=0;
        this.state={
            queries:[],
            pending_queries:[],
            last_query:null
        }
    }


  runQuery(info){
    const {  query_json_string,
      query_val,
      query_type,
      query_description,
    } = info;

    const newquery_id = this.querycounter++
    info.query_id =newquery_id
    console.log(this)
    const aq = this.addQuery.bind(this)


    fetch(query_json_string).then(function (response) {
        return response.json();

    }).then(myJson => {
        let idx = -1;
        _.map(myJson, (d, k) => {
            idx += 1;
            aq( {
              query_id:info.query_id,
              query_val,
              query_type,
              query_description,
              query_json_string,
              query_params:{ format:"json" },
              query_id:newquery_id,
              query_term:k,                
              query_result:d,
              query_pagesize:50000,
              query_page:0,
            })
        });
    });
    const pq = this.state.pending_queries
    pq.push(info)
    this.setState({pending_queries:pq})
}

    addQuery(query_props){
        const current_queries =this.state.queries;
        let  next_idx = -1;
        for(var i = 0; i<current_queries.length+1; i++){
          if (! current_queries.map(e=>e.query_order).includes(i)){
            next_idx = i
            break
          }
        }

        const pending_queries_new = _.compact(this.state.pending_queries.map(e=>{
          return e.query_id!=query_props.query_id?e:null;
        }))


        query_props.query_order = next_idx;
        current_queries.push( query_props);

        this.setState({queries:current_queries,
            pending_queries:pending_queries_new})

        this.queriesUpdated()

      }

      nextPageById(query_id){
        const current_queries= this.state.queries
        var active_queries = current_queries.filter(q=>q.query_id==query_id)
        for(let q of active_queries){
          q.query_page += 1
          if(q.query_page*q.query_pagesize>q.query_result.length){q.query_page=0}
        }
        this.setState({queries:current_queries})
        this.queriesUpdated()
      }
      showAllById(query_id){
        const current_queries= this.state.queries
        var active_queries = current_queries.filter(q=>q.query_id==query_id)
        for(let q of active_queries){q.query_pagesize += q.query_result.length}
        this.setState({queries:current_queries})
        this.queriesUpdated()
      }
      setQueryOrderById(query_id,new_order){
        const current_queries =this.state.queries;
        var colliding_queries = current_queries.filter(q=>q.query_order==new_order)
        var active_query = current_queries.filter(q=>q.query_id==query_id)
        
  
        if (active_query.length == 0){return}
        else{ active_query[0].query_order=new_order}

        if (colliding_queries.length > 0){
          for(var q of colliding_queries){
            let next_idx = -1;
            for(var i = 0; i<current_queries.length+1; i++){
              if (! current_queries.map(e=>e.query_order).includes(i)){
                next_idx = i
                break
          }
          q.query_order=next_idx;
        }
          }
        }


      
        this.setState({queries:current_queries})
        this.queriesUpdated()
      }
      queriesUpdated(){

        for (var i = 0; i<3; i++){
          const matched = this.state.queries.filter((e)=>e.query_order==i)
          if(matched.length ==1){
            const q = matched[0]
            this.props.setActiveSlice(matched[0].query_result.slice(q.query_pagesize*q.query_page,q.query_pagesize*(q.query_page+1)), i , matched[0].query_term);
          } else{
            this.props.unsetUmiSlice(i)
          }
          

      }        

      this.props.setSelectionTime(Date.now());
      }
      removeQueryById(query_id){
        this.setState({queries:_.compact(this.state.queries.map(e=>{
          return e.query_id!=query_id?e:null;
        }))})

        this.queriesUpdated()
      }


      render(){

          return (
          <div>
              <WrappedComponent
              runQuery={this.runQuery.bind(this)}
              {...this.props}
              ></WrappedComponent>
          <QueryViewer queries={this.state.queries}
          pending_queries={this.state.pending_queries}
                       removeQueryById={this.removeQueryById.bind(this)}
                       showAllById={this.showAllById.bind(this)}
                       nextPageById={this.nextPageById.bind(this)}
                       which_dataset={this.props.which_dataset} 
                       setQueryOrderById={this.setQueryOrderById.bind(this)}   />
                             
                                </div>
          )
      }
      getLastQuery(){
          return this.state.last_query
      }

}
    )
}

export default withQueryManager;

const ColorSelector = (props)=>{
    return (
        <StyledColorSelector>
            <span 
            className={"blue swatch "+( props.color_index==0?"selected":"")}
            onClick = {(e) => {
              props.setQueryOrderById(props.query_id,0)

            }}
            />
            <span 
            className={"green swatch "+( props.color_index==1?"selected":"")}
            onClick = {(e) => props.setQueryOrderById(props.query_id,1)}
            />
            <span className={"red swatch "+( props.color_index==2?"selected":"")}
            onClick = {(e) => props.setQueryOrderById(props.query_id,2)}/>
 

        </StyledColorSelector>
    )
    
}

const StyledColorSelector = styled.div`

margin-left:20px;
display:flex;
white-space:nowrap;
.swatch{
  cursor:pointer;

    display:inline-block;
    &.red{background-color:red}
&.blue{background-color:blue}
&.green{background-color:green}

.query-term{
  font-weight:bold;
}

&.selected{
    outline:1px solid white;
}
&:hover{
  outline :1px dotted white;
}

outline-offset:2px;
margin-left:6px;
margin-right:6px;
position:relative;
width:14px;
height:14px;

`;


const QueryViewer =(props)=>{


  const queries = props.queries;

  const listItems = queries.map((q) =>
    <li><UmiQuery {...q}
    nextPage={()=>props.nextPageById(q.query_id)}
    showAll={()=>props.showAllById(q.query_id)}
    ></UmiQuery> 
        <span className="flex-floater"><ColorSelector setQueryOrderById={props.setQueryOrderById}
         query_id={q.query_id} 
         color_index={q.query_order}></ColorSelector>
        <JupyterLauncher 
        which_dataset={props.which_dataset} 
        last_query={q.query_json_string}/>
        <Close  className="close" onClick={() => props.removeQueryById(q.query_id)}/>
        </span>
       </li>
  );
  console.log(props.pending_queries)
  const pendingItems = props.pending_queries.map((q)=>
    <li><PendingQuery {...q}/></li>
  )
  return (
  <StyledQueryViewer><ul>{listItems}{pendingItems}</ul></StyledQueryViewer>
  )
}
const StyledQueryViewer = styled.div`

@keyframes ellipsis {
  to {
    width: 1.25em;    
  }
}

.query-info{
  display: flex;
  align-items: center;
  margin-right:25px;

  .loading:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    -webkit-animation: ellipsis steps(4,end) 900ms infinite;      
    animation: ellipsis steps(4,end) 900ms infinite;
    content: …;
    width: 0px;
  }
  


  .button{
    color:blue;
    cursor:pointer;
    text-decoration:underline;
  }
  .query-term{
    font-weight:bold;
    &.color-0{ color:blue; }
    &.color-1{ color:green; }
    &.color-2{ color:red; }
  }
  span{
    margin-left:.5em;
  }
}
  position: fixed;
  left:0px;
  top:0px;
  height:auto;
  margin:20px;
  .logo-container{
    display:inline-block;
  }
  .close{
    cursor:pointer
    margin-left:20px;
    overflow:visible;
    &:hover{
      color:red;
    }
  }

.flex-floater{
  margin-left:auto;
  flex-direction: row;
    align-items: center;
    display:flex;
    whitespace:no-wrap;
    margin-right:5px;

  }
img{
  width:auto; 
}
  ul{list-style: none;
     margin-left: 0px;
     padding-left:0px;
     margin-top:0px;
    }
  
  li{
    background-color: rgba(0, 0, 0, 1);
    margin:0px;
    &:not(:first-child){margin-top:20px;}
    height:30px;
    border:2px solid white;
    border-radius:4px;
    display:flex;

    padding: 4px;
    padding-left: 20px;
    padding-right: 20px;
    
  }
}`