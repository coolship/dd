import React, { Component } from 'react';


import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'


import logo from './logo.svg';
import './App.css';
import V1SlideViewer from './V1SlideViewer';


class Viewer extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
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
      <ul>
        <li><Link to="/">Viewer</Link></li>
        <li><Link to="/welcome">welcome</Link></li>
        <li><Link to="/about">about</Link></li>
      </ul>

      <hr/>

      <Route exact path="/" component={Viewer}/>
      <Route path="/welcome" component={Welcome}/>
      <Route path="/about" component={About}/>
    </div>
  </Router>
)
export default App


