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
        if (error) {
          return console.log('Error: ' + error)
        }
      
        const campaignId = data.returnValues[0]
        const donationAmount = data.returnValues[1]
        const email = data.returnValues[2]
        console.log('campaignId: ' + campaignId)
        console.log('donationAmount: ' + donationAmount)
        console.log('email: ' + email)
        this.pullList()
        // mail.donationMade(campaignId, donationAmount, email, await filledPercentage(campaignId))
      })

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
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
    console.log(list)
    this.setState({
      list: list
    })

    // await contract.methods.donate(3, 'zarej@svrljig.net').send({ from: accounts[0], value: 1000000000000000000 })

    // console.log(accounts)
    // Stores a given value, 5 by default.
    // await contract.methods.set(5).send({ from: accounts[0] });

    // // Get the value from the contract to prove it worked.
    // const response = await contract.methods.get().call();

    // // Update state with the result.
    // this.setState({ storageValue: response });
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
  handleCreateCampaign = (data) => {
    const { accounts, contract } = this.state;
    // console.log('Create campaign', data)
    contract.methods.createCampaign(data.name, data.description, data.email, data.imageUrl, this.state.web3.utils.toWei(data.targetAmount, 'ether'), data.beneficiaryAddress).send({ from: accounts[0] })
    this.handleCloseModal()
  }
  handleCloseModal = () => {
    this.setState({
      isModal: false,
      isCreateCampaign: false
    })

  }
  handleDonation = (data, userData) => {
    const { accounts, contract } = this.state;
    // console.log('Donation', data, userData)
    // data.beneficiaryAddress
    contract.methods.donate(data.id, userData.email).send({ from: accounts[0], value: this.state.web3.utils.toWei(userData.ethAmount, 'ether') })
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
              return <Campaign campaign={campaign} index={i} key={i} donation={this.handleDonation} />;
            })}
          </div>
        </div>
        <footer></footer>
      </div>
    );
  }
}

export default App;
