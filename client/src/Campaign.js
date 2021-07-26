import React, { Component } from "react";

import "./Campaign.css";
import { ethDisplay, trimText } from './util'

class Campaign extends Component {

  constructor(props) {
    super(props);

    let colorArray = ['#00baa3', '#efc94c', '#d55342', '#2780ba']

    console.log("Campaign", props.campaign)
    // console.log("Index", props.index)
    let progress = (props.campaign.currentAmount / props.campaign.targetAmount) * 100
    let progressText = progress
    if (progress > 100) progress = 100
    // console.log('progress', progress)
    let color = colorArray[props.index % 4]
    let cover = 'cause-' + this.props.index % 7 + '.jpg'
    if (props.campaign.image) cover = props.campaign.image
    this.state = {
      ethAmount: 0,
      email: '',
      campaign: null,
      progress: progress,
      progressText: progressText,
      color: color,
      isDonationInProgress: false,
      cover: cover
    }
  }

  donationClick = () => {
    // this.props.donation(this.props.campaign)
    this.setState({ isDonationInProgress: true })
  }
  donationFinish = () => {
    this.props.donation(this.props.campaign, {
      email: this.state.email,
      ethAmount: this.state.ethAmount
    })
  }
  donationCancel = () => {
    this.setState({ isDonationInProgress: false })
  }
  onInputchange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  render() {
    let renderDonate, renderBody
    renderBody = <div className="campaignDescription">{trimText(this.props.campaign.description, 100)}</div>
    if (this.state.isDonationInProgress) {
      renderBody = <div>
        <strong>Donate: </strong>
        <input type="number" className="donateInput ethValue"
          name="ethAmount"
          value={this.state.ethAmount}
          onChange={this.onInputchange}
        />
        <div className="eth"></div>
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
      return (
        <div className="campaignWrapper">
          <div className={`campaign ${this.props.campaign.active ? "active" : "inactive"}`}>
            <div className="finished">Campaign Sucsesfull</div>
            <div className="campaignPhoto" style={{
              backgroundImage: `url("${this.state.cover}")`
            }}>
              <h2 className="campaignName" style={{ backgroundColor: this.state.color }}>{this.props.campaign.name}</h2>
            </div>
            <div className="campaignBody">
              {renderBody}
              {renderDonate}
              <div className="campaignGoalWrapper"><div className="campaignGoalProgress"><div className="campaignProgressText" style={{ left: this.state.progress + "%", backgroundColor: this.state.color }} ><strong>{this.state.progressText}%</strong></div><div className="campaignProgress" style={{ width: this.state.progress + '%', backgroundColor: this.state.color }}></div></div></div>
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
