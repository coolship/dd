import React, { Component } from 'react';
import './css/App.css';
import V1SlideViewer from './V1SlideViewer';
import MyGoogleLogin from './GoogleLogin'



class App extends Component {

    constructor(props){
	super(props)
	this.state ={
	    datasets:[],
	};
    }
    
    setAccessToken(token){
	this.setState({"access_token":token})
	this.activateUser()
    }



    activateUser(){
	var list_directory_url = "https://www.googleapis.com/storage/v1/b/slides.dna-microscopy.org/o"
	const token = this.state.access_token
	var that = this
	fetch(list_directory_url,{
	    method:'GET',
	    headers:{
		"Content-Type": "application/json",
		'Authorization': 'Bearer ' + token,
	    }
	}).then(function(response){
	    return response.json()
	}).then(function(success){

	    var result = success
	    that.setState({datasets:result.items.map(function(e,i){return e.name})
			   .filter(function(e){return e.search("dataset")>=0
					       && e.split("/").slice(-1) != "" })
			  })
	    that.setState({directoryListing:result})
	})

    }
       
    render() {
	
      return (


	  
	      <div className="App">

	  
		<MyGoogleLogin
	    setAccessToken={this.setAccessToken.bind(this)}
	    hasAccessToken={!!this.state.access_token}
		/>

	  
	      <V1SlideViewer
	  accessToken={this.state.access_token}
	  datasets={this.state.datasets}>

	</V1SlideViewer>
      </div>
    );
  }
}




export default App


