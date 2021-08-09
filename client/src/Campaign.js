import React, { Component } from "react";

import TokenSelector from "./TokenSelector"
import "./Campaign.css";
import { ethDisplay, trimText } from './util'

class Campaign extends Component {

  constructor(props) {
    super(props);

    let colorArray = ['#00baa3', '#efc94c', '#d55342', '#2780ba']

    // console.log("Campaign", props.campaign)
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
    }
  }

  donationClick = () => {
    // this.props.donation(this.props.campaign)
    this.setState({ isDonationInProgress: true })
  }
  donationFinish = () => {
    if (this.state.ethAmount > 0) {
      this.props.donation(this.props.campaign, {
        email: this.state.email,
        ethAmount: this.state.ethAmount
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
    this.setState({
      token: token
    })
  }

  render() {
    let progress = Math.round((this.props.campaign.currentAmount / this.props.campaign.targetAmount) * 100)
    let progressText = progress
    if (progress > 100) progress = 100

    let renderDonate, renderBody
    renderBody = <div className="campaignDescription">{trimText(this.props.campaign.description, 100)}</div>
    if (this.state.isDonationInProgress) {
      renderBody = <div>
        <div className="flexRow">
          <div className="col8">
            <strong>Donate: </strong>
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
              <div className="campaignRaised"><strong>Raised:</strong> {ethDisplay(this.props.campaign.currentAmount)}<div className="eth"></div></div>
              <div className="campaignGoal"><strong>Goal:</strong> {ethDisplay(this.props.campaign.targetAmount)}<div className="eth"></div></div>
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
