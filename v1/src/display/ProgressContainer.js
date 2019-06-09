import styled, { css } from 'styled-components';

const ProgressContainer=styled.div`
position:relative;
height:40px;
width:100%;
border:2px solid;
border-radius:3px;

.fill{
background-color:rgba(0,0,255,.5);
height:100%;
position:absolute;
left:0px;
top:0px;
bottom:0px;
points-events:none;
right:${props => 100 - props.progress}%;
}
.message{
left:50%;
top:50%;
transform:translate(-50%, -50%);
position:absolute;
}
`;


export default ProgressContainer;