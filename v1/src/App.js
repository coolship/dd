import React, { Component } from 'react';


import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'


import './css/App.css';
import V1SlideViewer from './V1SlideViewer';


class Viewer extends Component {
  render() {
    return (
      <div className="App">
	    <V1SlideViewer>

	</V1SlideViewer>
      </div>
    );
  }
}


const Welcome = () => (
  <div>
    <h2>Welcome</h2>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)



const App = () => (
  <Router>
	<div>
	<Route exact path="/" component={Viewer}/>
	<Route path="/welcome" component={Welcome}/>
	<Route path="/about" component={About}/>
	</div>
  </Router>
)
export default App


