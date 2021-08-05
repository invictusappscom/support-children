import React, { Component } from "react"

import "./CreateCamapign.css";
import TokenSelector from "./TokenSelector"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

class CreateCampaign extends Component {
    state = {
        name: '',
        description: '',
        email: '',
        beneficiaryAddress: '',
        targetAmount: 0,
        errorName: false,
        errorEmail: false,
        errorTarget: false,
        errorBeneficiaryAddress: false,
        imageUrl: '',
        token: this.props.tokens[0],
        startDate: new Date(),
    }
    constructor(props) {
        super(props)
    }
    onInputchange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    saveCampaignHandle = () => {
        let error = false
        if (this.state.name == '') {
            this.setState({ errorName: true })
            error = true
        }
        if (this.state.email == '') {
            this.setState({ errorEmail: true })
            error = true
        }
        if (this.state.targetAmount <= 0) {
            this.setState({ errorTarget: true })
            error = true
        }
        if (this.state.beneficiaryAddress == '') {
            this.setState({ errorBeneficiaryAddress: true })
            error = true
        }
        if (!error) {
            this.props.createCampaign({
                name: this.state.name,
                email: this.state.email,
                description: this.state.description,
                targetAmount: this.state.targetAmount,
                imageUrl: this.state.imageUrl,
                beneficiaryAddress: this.state.beneficiaryAddress,
            })
        }
    }
    closeModal = () => {
        this.props.closeModal()
    }
    setToken = (token) => {
        console.log('Set Token', token)
        this.setState({
            token: token
        })
    }
    setStartDate = (date) => {
        this.setState({
            startDate: date
        })
    }
    render() {
        return (
            <div id="createCamapignWrapper">
                <div className="createCamapignBg"></div>
                <div className="createCamapignBody">
                    <h3>Create Campaign</h3>
                    <div className="flexRow">
                        <div className="col6">
                            <input type="text" placeholder="Campaign Name" className={`${this.state.errorName ? "error" : ""}`}
                                name="name"
                                value={this.state.name}
                                onChange={this.onInputchange}
                            />
                        </div>
                        <div className="col3 ethCell">
                            <input type="number" placeholder="Target Amount" className={`${this.state.errorTarget ? "error" : ""}`}
                                name="targetAmount"
                                value={this.state.targetAmount}
                                onChange={this.onInputchange}
                            />
                        </div>
                        <div className="col3 ethCell">
                            <TokenSelector tokens={this.props.tokens} setToken={this.setToken} />
                        </div>
                    </div>
                    <input type="text" placeholder="Beneficiary Address" className={`${this.state.errorBeneficiaryAddress ? "error" : ""}`}
                        name="beneficiaryAddress"
                        value={this.state.beneficiaryAddress}
                        onChange={this.onInputchange}
                    />
                    <textarea placeholder="Description"
                        name="description"
                        value={this.state.description}
                        onChange={this.onInputchange}
                    ></textarea>
                    <input type="text" placeholder="Email" className={`${this.state.errorEmail ? "error" : ""}`}
                        name="email"
                        value={this.state.email}
                        onChange={this.onInputchange}
                    />
                    <div className="flexRow">
                        <div className="col6">
                            <input type="text" placeholder="Image URL"
                                name="imageUrl"
                                value={this.state.imageUrl}
                                onChange={this.onInputchange}
                            />
                        </div>
                        <div className="col6">
                            <span>Valid till: </span>
                            <DatePicker selected={this.state.startDate}
                                onChange={(date) => this.setStartDate(date)}
                            />
                        </div>
                    </div>
                    <div id="createCampaignSave" onClick={this.saveCampaignHandle}>Create Campaign</div>
                    <div id="createCampaignCancel" onClick={this.closeModal}>Cancel</div>
                </div>
            </div>
        )
    }
}

export default CreateCampaign;
