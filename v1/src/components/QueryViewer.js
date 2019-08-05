

import Close from "react-icons/lib/md/close";
let querycounter = 0;
const UmiQuery = (props)=>{
  //const [last_query, saveLastQuery] = useState(null)
  return (
    <span><span>{props.query_type}</span>: <span>{props.query_term}</span></span>
  )
}
const QueryViewer =(props)=>{

  const queries = props.queries;
  const listItems = queries.map((q) =>
    <li>{q} <Close  onClick={() => props.removeQueryById(q.props.query_id)}></Close></li>
  );
  return (
  <StyledQueryViewer><ul>{listItems}</ul></StyledQueryViewer>
  )
}
const StyledQueryViewer = styled.div`
  position: absolute;
  transform: translate(0px, -20px);
  bottom: 100%;
  list-style: none;
  margin-left: 0px;
  
  li{
    background-color: rgba(0, 0, 0, .25);
    margin_20px;
    border:2px solid white;
    border-radius:4px;
    
  }
}`