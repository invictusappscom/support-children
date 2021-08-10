import React, { Component } from "react";

import "./TokenSelector.css";

class TokenSelector extends Component {
    state = {
        activToken: this.props.tokens[0],
    }
    constructor(props) {
        super(props)
    }
    handleTokenClick = (token) => {
        // console.log('tokens:', data.name)
        this.props.setToken(token)
        this.setState({
            activToken: token
        })
    }
    render() {
        return (
            <div>
                <div className="selectField">
                    <div>{this.state.activToken.name}<div className={`tokenImg ${this.state.activToken.cssClass}`}></div></div>
                    <ul>
                        {this.props.tokens.map((token, i) => {
                            return <li onClick={() => { this.handleTokenClick(token) }} key={i}>{token.name}<div className={`tokenImg ${token.cssClass}`}></div></li>
                        })}
                    </ul>
                </div>
            </div>
        )
    }
}

export default TokenSelector;
