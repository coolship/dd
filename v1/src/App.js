import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import V1SlideViewer from './V1SlideViewer';


class App extends Component {
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

export default App;
