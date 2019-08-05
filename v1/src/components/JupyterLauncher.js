import React, {Component} from "react";
import styled from "styled-components";
import JupyterLogo from '../assets/Jupyter_logo.svg';
import ReactDOM from "react-dom";
import _ from "lodash";

export default class JupyterLauncher extends Component {
    constructor(props) {
        super(props);
        this.controls = React.createRef();
        this.state={spinning:false}

    }

    handleClick() {
        let which = this.props.which_dataset;
        this.setState({spinning:true})
        fetch("http://35.237.243.111:5000/analysis/" + which + `/generate_notebook/?last_query=${encodeURIComponent(this.props.last_query)}`)
            .then(function (response) {
                return response.json();
            })
            .then(myJson => {
                window.open(myJson.url, "_blank")
                this.setState({spinning:false})
            })
    }
    //this cool little piece of code in-lines the svg used for the controls
    handleImageLoaded() {
        var c = ReactDOM.findDOMNode(this.controls.current)
        c.parentElement
            .replaceChild(c.contentDocument.documentElement.cloneNode(true), c);
    }
    render() {
        return (
            <StyledLogoContainer className="logo-container" >
                <img
                className={this.state.spinning?"spin":""}
                    src={JupyterLogo}
                    onClick={this.handleClick.bind(this)}/>
                    </StyledLogoContainer>
                    
        )
    }

}

const StyledLogoContainer=styled.span`
cursor:pointer;

@keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
}
    img{
        &:hover:not(.spin){
            transition: transform .2s ease;
            transform:rotate(25deg);
        }
    &.spin{

        animation-name: spin;
        animation-duration: 2000ms;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in; 
    }    
        height:2em;
        filter: saturate(0) brightness(100);
        background-color:transparent !important;
    }
    border: 2px solid orange;
    border-radius: 2em;
    width: 2em;
    height: 2em;
    box-shadow: 0px 0px 3px 4px black;
    background-color: black !important;
    




  `