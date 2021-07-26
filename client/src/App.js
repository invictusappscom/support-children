import React, { Component } from "react";
import SupportChildrenContract from "./contracts/SupportChildren.json";
import { getWeb3 } from "./getWeb3";

import Campaign from "./Campaign";
import Modal from "./Modal";
import CreateCampaign from "./CreateCampaign";

import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    list: [],
    isModal: false,
    isCreateCampaign: false
  };
  componentDidMount = async () => {
    this._child = React.createRef();
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SupportChildrenContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SupportChildrenContract.abi,
        deployedNetwork && deployedNetwork.address
      )

      instance.events.DonationMade({}, async (error, data) => {
        // console.log('DonationMade')
        if (error) {
          return console.log('Error: ' + error)
        }
        this.refreshList()
      })

      instance.events.CampaignFinished({}, async (error, data) => {
        // console.log('CampaignFinished')
        if (error) {
          return console.log('Error: ' + error)
        }
        this.refreshList()
      })

      instance.events.CampaignCreated({}, async (error, data) => {
        // console.log('CampaignCreated')
        this.refreshList()
      })


      this.setState({ web3, accounts, contract: instance }, this.pullList);


      // console.log(instance);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  pullList = async () => {
    const { accounts, contract } = this.state;
    let list = await contract.methods.getCampaigns().call()
    // console.log(list)
    this.setState({
      list: list
    })
  }

  handlePress = () => {
    this.setState({
      isModal: true,
      isCreateCampaign: true
    })
  }
  handleModalClick = () => {
    this.handleCloseModal()
  }
  handleCreateCampaign = async (data) => {
    const { accounts, contract } = this.state;
    // console.log('Create campaign', data)
    this.handleCloseModal()
    try {
      await contract.methods.createCampaign(data.name, data.description, data.email, data.imageUrl, this.state.web3.utils.toWei(data.targetAmount, 'ether'), data.beneficiaryAddress).send({ from: accounts[0] })
    } catch (e) {
      this.refreshList()
    }
  }
  handleCloseModal = () => {
    this.setState({
      isModal: false,
      isCreateCampaign: false
    })
  }
  refreshList = () => {
    try {
      this._child.current.refreshPage()
      this.pullList()
    } catch (e) {
      console.log(e)
    }
  }
  handleDonation = async (data, userData) => {
    const { accounts, contract } = this.state;
    // console.log('Donation', data, userData)
    // data.beneficiaryAddress
    try {
      await contract.methods.donate(data.id, userData.email).send({ from: accounts[0], value: this.state.web3.utils.toWei(userData.ethAmount, 'ether') })
    } catch (e) {
      this._child.current.refreshPage()
      this.pullList()
    }
  }
  removeCampaign = async (id) => {
    // console.log('removeCampaign', id)
    const { accounts, contract } = this.state;
    try {
      await contract.methods.endCampaign(id).send({ from: accounts[0] })
    } catch (e) {
      this._child.current.refreshPage()
      this.pullList() 
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    let modal, createCampaign
    if (this.state.isModal) {
      modal = <Modal closeModal={this.handleCloseModal} />;
    }
    if (this.state.isCreateCampaign) {
      createCampaign = <CreateCampaign createCampaign={this.handleCreateCampaign} closeModal={this.handleCloseModal} />;
    }
    return (
      <div className="App">
        {modal}
        {createCampaign}
        <header>
          <div className="wrapper">
            <div id="addCampaign" onClick={this.handlePress}>Add Campaign</div>
          </div>
        </header>
        <div className="content">
          <div className="list">
            {this.state.list.map((campaign, i) => {
              return <Campaign campaign={campaign} index={i} key={i} donation={this.handleDonation} accounts={this.state.accounts} ref={this._child} removeCampaign={this.removeCampaign} />;
            })}
          </div>
        </div>
        <footer></footer>
      </div>
    );
  }
}

export default App;
