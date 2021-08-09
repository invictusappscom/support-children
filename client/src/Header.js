import React, { Component } from "react";

import "./Header.css";
import { ethDisplay, trimText } from './util'

class Header extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    let button
    if (this.props.isLogged || window.localStorage.getItem('logedIn') == 'true') {
      button = <><div id="loginRegister" onClick={this.props.logout}>Logout</div><div id="addCampaign" onClick={this.props.handlePress}>Add Campaign</div></>
    } else {
      button = <><div id="loginRegister" onClick={this.props.loginRegister}>Login / Register</div><div id="addCampaign" onClick={this.props.handlePress}>Add Campaign</div></>
    }
    return (
      <header>
        <div className="wrapper">
          <div className="logo"></div>
          {button}
        </div>
      </header>
    )
  }
}

export default Header;
