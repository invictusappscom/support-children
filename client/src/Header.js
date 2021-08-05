import React, { Component } from "react";

import "./Header.css";
import { ethDisplay, trimText } from './util'

class Header extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header>
        <div className="wrapper">
          <div className="logo"></div>
          <div id="addCampaign" onClick={this.props.handlePress}>Add Campaign</div>
          <div id="loginRegister" onClick={this.props.loginRegister}>Login / Register</div>
        </div>
      </header>
    )
  }
}

export default Header;
