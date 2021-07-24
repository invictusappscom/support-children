import React, { Component } from "react";
import SupportChildrenContract from "./contracts/SupportChildren.json";
import getWeb3 from "./getWeb3";

import Campaign from "./Campaign";

import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    list: []
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
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);


      console.log(instance);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    let list = await contract.methods.getCampaigns().call()
    // console.log(list)
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
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <header></header>
        <div className="list">
        {this.state.list.map(function (campaign, i) {
          return <Campaign campaign={campaign} index={i} key={i} />;
        })}
        </div>
        <footer></footer>
      </div>
    );
  }
}

export default App;
