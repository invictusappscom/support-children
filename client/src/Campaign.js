import React, { Component } from "react";

import "./Campaign.css";
import { ethDisplay } from './util'

class Campaign extends Component {
  
  constructor(props) {
    super(props);
    
    let colorArray = ['#00baa3', '#efc94c', '#d55342', '#2780ba']

    console.log("Campaign", props.campaign)
    // console.log("Index", props.index)
    let progress = (props.campaign.currentAmount / props.campaign.targetAmount) * 100
    if (progress > 100) progress = 100
    // console.log('progress', progress)
    let color = colorArray[props.index % 4]
    this.state = {
      campaign: null,
      progress: progress,
      color: color
    }
    // this.setState({
    //   progress: progress
    // })
  }

  render() {
    if (this.props.campaign) {
      return (
        <div className="campaignWrapper">
          <div className={`campaign ${this.state.active ? "active" : "inactive"}`}>
            <div className="finished">Campaign Sucsesfull</div>
            <div className="campaignPhoto" style={{
              backgroundImage: `url("http://www.nicdarkthemes.com/themes/charity/wp/demo/charity-foundation/wp-content/uploads/sites/3/2017/04/cause-${this.props.index + 1}.jpg")`
            }}></div>
            <div className="campaignBody">
              <h2 className="campaignName">{this.props.campaign.name}</h2>
              <div className="campaignDescription">{this.props.campaign.description}</div>
              <div className="campaignGoalWrapper"><div className="campaignGoalProgress"><div className="campaignProgressText" style={{ left: this.state.progress + "%", backgroundColor: this.state.color }} ><strong>{this.state.progress}%</strong></div><div className="campaignProgress" style={{width: this.state.progress + '%', backgroundColor: this.state.color  }}></div></div></div>
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
