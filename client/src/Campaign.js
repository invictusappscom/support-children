import React, { Component } from "react";
// import { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } from "@uniswap/sdk";

import TokenSelector from "./TokenSelector"
import "./Campaign.css";
import { ethDisplay, trimText } from './util'

import Uniswap from './uniswap';
import { client } from './uniswap'
import { ApolloProvider } from 'react-apollo'
import axios from "axios"

class Campaign extends Component {

  constructor(props) {
    super(props);

    let colorArray = ['#00baa3', '#efc94c', '#d55342', '#2780ba']

    console.log("Campaign", props.campaign)
    // console.log("Accounts", props.accounts)
    let owner = false
    if (props.accounts.indexOf(props.campaign.creatorAddress) !== -1) owner = true
    // console.log("Index", props.index)
    let progress = (props.campaign.currentAmount / props.campaign.targetAmount) * 100
    let progressText = progress
    if (progress > 100) progress = 100
    // console.log('progress', progress)
    let color = colorArray[props.index % 4]
    let cover = 'cause-' + this.props.index % 7 + '.jpg'
    if (props.campaign.image) cover = props.campaign.image
    this.state = {
      reload: false,
      ethAmount: 0,
      ethAmountError: false,
      email: '',
      campaign: null,
      progress: progress,
      progressText: progressText,
      color: color,
      isDonationInProgress: false,
      cover: cover,
      paymantInProgress: false,
      removingInProgress: false,
      owner: owner,
      loaderText: '',
      token: this.props.tokens[0],
      campaignToken: this.props.tokens[0],
      unisvapProgress: false,
    }
  }

  donationClick = () => {
    // this.props.donation(this.props.campaign)
    this.setState({
      isDonationInProgress: true,
      unisvapProgress: true
    })
  }
  donationFinish = () => {
    if (this.state.ethAmount > 0) {
      this.props.donation(this.props.campaign, {
        email: this.state.email,
        ethAmount: this.state.ethAmount,
        token: this.state.token
      })
      this.setState({
        isDonationInProgress: false,
        paymantInProgress: true,
        loaderText: 'Paymant In Progress'
      })
    } else {
      this.setState({
        ethAmountError: true
      })
    }
  }
  donationCancel = () => {
    this.setState({ isDonationInProgress: false })
  }
  onInputchange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })

    let url = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    let data = { query: "{ pairs(where: { token0: \"" + this.state.token.address.toLowerCase() + "\" token1: \"" + this.props.campaign.targetCurrency.toLowerCase() + "\" }) { token0Price token1Price }}" }
    let axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
      }
    }
    axios
      .post(url, data, axiosConfig)
      .then((response) => {
        console.log('uniswap response', response.data.data.pairs)
        if (Array.isArray(response.data.data.pairs)) {
          try {
            let calculateValue = response.data.data.pairs[0].token1Price * this.state.ethAmount
            this.setState({
              calculateValue: calculateValue
            })
          } catch (e) { }
        }
      })

  }
  refreshPage = () => {
    this.setState(
      {
        paymantInProgress: false,
        removingInProgress: false
      }
    )
  }
  removeCampaign = () => {
    this.props.removeCampaign(this.props.campaign.id)
    this.setState(
      {
        removingInProgress: true,
        loaderText: 'Deactivate In Progress'
      }
    )
  }
  setToken = (token) => {
    console.log('Set Token', token)
    console.log(token, this.props.campaign.targetCurrency)
    let url = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    let data = { query: "{ pairs(where: { token0: \"" + token.address.toLowerCase() + "\" token1: \"" + this.props.campaign.targetCurrency.toLowerCase() + "\" }) { token0Price token1Price }}" }
    let axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
      }
    }
    if (token.address.toLowerCase() === this.props.campaign.targetCurrency.toLowerCase()) {
      this.setState({
        calculateValue: this.state.ethAmount
      })
    } else {
      axios
        .post(url, data, axiosConfig)
        .then((response) => {
          console.log('uniswap response', response.data.data.pairs)
          if (Array.isArray(response.data.data.pairs)) {
            try {
              let calculateValue = response.data.data.pairs[0].token1Price * this.state.ethAmount
              this.setState({
                calculateValue: calculateValue
              })
            } catch (e) { }
          }
        })
    }

    this.setState({
      token: token,
      // unisvapProgress: true,
      tokenIn: token
    })
  }

  uniswapReturn = (data) => {
    console.log(data)
    this.setState({
      unisvapProgress: false
    })

  }

  // prepareUniswap(token0Address, token1Address, token1Amount) {
  //   // https://github.com/jklepatch/eattheblocks/blob/master/screencast/217-uniswap-v2/javascript/index.js
  //   const chainId = ChainId.MAINNET;
  //   const token0 = await Fetcher.fetchTokenData(chainId, token0Address);
  //   const token1 = await Fetcher.fetchTokenData(chainId, token1Address);

  //   const pair = await Fetcher.fetchPairData(token0, token1);
  //   const route = new Route([pair], token1);

  //   const trade = new Trade(route, new TokenAmount(token1, token1Amount), TradeType.EXACT_INPUT);

  //   const slippageTolerance = new Percent('50', '10000');
  //   const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
  //   const path = [token0Address, token1Address];
  //   const to = '';
  //   const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  //   const value = trade.inputAmount.raw;

  // }

  render() {
    let renderDonate, renderBody, uniswapElement

    // if (this.state.unisvapProgress) {
    //   uniswapElement = <ApolloProvider client={client}><Uniswap tokenIn={this.state.tokenIn} tokenOut={this.state.tokenOut} uniswapReturn={this.uniswapReturn} /></ApolloProvider>
    // } else {
    //   uniswapElement = <></>
    // }

    let currencyClass = 'tokenEth'
    this.props.tokens.map((token) => {
      // console.log(token.address, this.props.campaign.targetCurrency, token.cssClass)
      if (token.address.toLowerCase() === this.props.campaign.targetCurrency.toLowerCase()) {
        currencyClass = token.cssClass
      }
    })


    let progress = Math.round((this.props.campaign.currentAmount / this.props.campaign.targetAmount) * 100)
    let progressText = progress
    if (progress > 100) progress = 100

    renderBody = <div className="campaignDescription">{trimText(this.props.campaign.description, 100)}</div>
    if (this.state.isDonationInProgress) {
      renderBody = <div>
        <div className="flexRow">
          {/* <div className="col3"><strong>Donate: </strong></div> */}
          <div className="col8">

            <input type="number" className={`donateInput ethValue ${this.state.ethAmountError ? "error" : ""}`}
              name="ethAmount"
              value={this.state.ethAmount}
              onChange={this.onInputchange}
            />
          </div>
          <div className="col4">
            <TokenSelector tokens={this.props.tokens} setToken={this.setToken} />
          </div>
        </div>
        <div className="flexRow">
          <div className="col10">
            <input type="number" className={`donateInput ethValue`}
              name="calculateValue"
              value={this.state.calculateValue}
              disabled
            />
          </div>
          <div className="col2">
            <div className={`tokenImg ${currencyClass}`}></div>
          </div>
        </div>
        <input type="text" className="donateInput"
          placeholder="email"
          name="email"
          value={this.state.email}
          onChange={this.onInputchange}
        />
      </div>
      renderDonate = <div className="donateBtnWrapper">
        <div className="donateFinish" onClick={this.donationFinish}>Send Donation</div>
        <div className="donateCancel" onClick={this.donationCancel}>Cancel</div>
      </div>
    } else if (this.props.campaign.active) {
      renderDonate = <div className="donateBtn" onClick={this.donationClick}>Donate Now</div>
    }

    if (this.props.campaign) {
      let flag
      if (parseInt(this.props.campaign.currentAmount) >= parseInt(this.props.campaign.targetAmount)) {
        flag = <div className="finished">Campaign Successful</div>
      } else {
        flag = <div className="finished">Campaign Inactive</div>
      }
      return (
        <div className="campaignWrapper">
          {uniswapElement}
          <div className={`campaign ${this.props.campaign.active ? "active" : "inactive"} ${this.state.removingInProgress ? "loading" : ""} ${this.state.paymantInProgress ? "loading" : ""} ${this.state.owner ? "owner" : ""} `}>
            <div className="removeCampaing" onClick={this.removeCampaign}></div>
            {flag}
            <div className="campaignPhoto" style={{
              backgroundImage: `url("${this.state.cover}")`
            }}
              onClick={this.refreshPage}
            >
              <h2 className="campaignName" style={{ backgroundColor: this.state.color }}>{this.props.campaign.name}</h2>
            </div>
            <div className="campaignBody">
              <div className="loader"><span>{this.state.loaderText}</span></div>
              {renderBody}
              {renderDonate}
              <div className="campaignGoalWrapper"><div className="campaignGoalProgress"><div className="campaignProgressText" style={{ left: progress + "%", backgroundColor: this.state.color }} ><strong>{progressText}%</strong></div><div className="campaignProgress" style={{ width: progress + '%', backgroundColor: this.state.color }}></div></div></div>
              <div className="campaignRaised"><strong>Raised:</strong> {ethDisplay(this.props.campaign.currentAmount)}<div className={`tokenImg ${currencyClass}`}></div></div>
              <div className="campaignGoal"><strong>Goal:</strong> {ethDisplay(this.props.campaign.targetAmount)}<div className={`tokenImg ${currencyClass}`}></div></div>
            </div>

          </div>
        </div>
      )
    } else {
      return (<div></div>)
    }
  }
}

export default Campaign;
