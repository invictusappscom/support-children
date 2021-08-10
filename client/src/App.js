import React, { Component } from "react";
import SupportChildrenContract from "./contracts/SupportChildren.json";
import { getWeb3 } from "./getWeb3";

import Header from "./Header";
import Campaign from "./Campaign";
import Modal from "./Modal";
import CreateCampaign from "./CreateCampaign";

import { getCookie } from './util'

// import { ApolloProvider } from 'react-apollo'

import ReactNotification from 'react-notifications-component'
import { store } from 'react-notifications-component';

import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css/animate.min.css'
import 'react-notifications-component/dist/theme.css'

// import Uniswap from './uniswap';
// import { client } from './uniswap'

import axios from "axios"

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    list: [],
    isModal: false,
    isCreateCampaign: false,
    isLoginRegister: false,
    tokenIn: null,
    tokenOut: null,
    isLogged: false,
    tokens: [
      {
        name: 'ETH',
        address: 'EHT',
        cssClass: 'tokenEth'
      },
      {
        name: 'DAI',
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        cssClass: 'tokenDai'
      },
      {
        name: 'WETH',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        cssClass: 'tokenWeth'
      },
      {
        name: 'OMG',
        address: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
        cssClass: 'tokenOmg'
      },
    ]

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
      const deployedNetwork = SupportChildrenContract.networks[networkId]
      const instance = new web3.eth.Contract(
        SupportChildrenContract.abi,
        deployedNetwork && deployedNetwork.address
      )

      let tokens = this.state.tokens
      tokens[0].address = deployedNetwork.address

      this.setState({
        tokens: tokens
      })

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

  handlePress = async () => {
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
    console.log('Create campaign', data)
    // console.info({
    //   name: data.name,
    //   desc: data.description,
    //   email: data.email,
    //   image: data.imageUrl,
    //   endTime: Math.round(new Date(data.endDate).getTime() / 1000),
    //   tokenIndex: 1,
    //   amount: this.state.web3.utils.toWei(data.targetAmount, 'ether'),
    //   address: data.beneficiaryAddress
    // })

    this.handleCloseModal()
    try {
      await contract.methods.createCampaign(data.name, data.description, data.email, data.imageUrl, Math.round(new Date(data.endDate).getTime() / 1000), data.tokenAddress, this.state.web3.utils.toWei(data.targetAmount, 'ether'), data.beneficiaryAddress).send({ from: accounts[0] })
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
    console.log('Donation', data, userData, accounts[0])
    if (data.targetCurrency === this.state.tokens[0].address && userData.token.address === this.state.tokens[0].address) {
      console.log('ETH 2 ETH')
      console.info(data.id, userData.email, accounts[0], this.state.web3.utils.toWei(userData.ethAmount, 'ether'))
      await contract.methods.donateEthToEthCampaign(data.id, userData.email).send({ from: accounts[0], value: this.state.web3.utils.toWei(userData.ethAmount, 'ether') })
    } else if (data.targetCurrency === this.state.tokens[0].address) {
      console.log('TOKEN 2 ETH')
    } else if (userData.token.address === this.state.tokens[0].address) {
      console.log('ETH 2 TOKEN')
    } else {
      console.log('TOKEN 2 TOKEN')
    }
    return
    // donateEthToEthCampaign
    // donateEthToTokenCampaign
    // donateTokenToETHCampaign
    // donateTokenToTokenCampaign
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

  loginRegister = async () => {
    let payload = '{"timestamp": ' + new Date().getTime() + '}'
    let signature = await this.state.web3.eth.personal.sign(payload, this.state.accounts[0])
    console.log(signature)
    let check = {
      signature,
      payload: btoa(payload)
    }
    // console.log(check)

    // let url = process.env.NODE_HOST + ':' + process.env.NODE_PORT + '/api/v1/register'

    let c = getCookie('challengetwotemplate.sid')
    // console.log('c', c)
    let url = 'http://localhost:3001/api/v1/register'
    if (c) {
      url = 'http://localhost:3001/api/v1/login'
    }


    if (document.cookie)
      axios
        .post(url, check
        )
        .then((response) => {
          console.log('response', response)
          if (response.status === 200) {
            localStorage.setItem('logedIn', 'true')
            this.setState({
              isLogged: true
            })
          }
        })


    // this.setState({
    //   tokenIn: 'DAI',
    //   tokenOut: 'ETH',
    //   isModal: true,
    //   isLoginRegister: true
    // })

    // store.addNotification({
    //   title: "Wonderful!",
    //   message: "teodosii@react-notifications-component",
    //   type: "success",
    //   insert: "top",
    //   container: "bottom-right",
    //   animationIn: ["animate__animated animate__fadeIn"],
    //   animationOut: ["animate__animated animate__fadeOut"],
    //   dismiss: {
    //     duration: 5000,
    //     onScreen: true
    //   }
    // })

    try {
      // this.state.web3.eth.personal.sign('{"timestamp":  1627753792758}', this.state.accounts[0]).then(console.log)
    } catch (e) {
      console.log({ error: e })
    }
  }

  logout = async () => {
    let url = 'http://localhost:3001/api/v1/logout'
    let axiosConfig = {
      headers: {
        "Cookie": document.cookie,
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
      },
      withCredentials: true
    }
    axios
      .post(url, null, axiosConfig)
      .then((response) => {
        console.log('response', response)
        if (response.status === 200) {
          localStorage.setItem('logedIn', 'false')
          this.setState({
            isLogged: false
          })
        }
      })
  }

  // uniswapReturn = (data) => {
  //   console.log(data)
  // }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    let modal, createCampaign
    if (this.state.isModal) {
      modal = <Modal closeModal={this.handleCloseModal} />;
    }
    if (this.state.isCreateCampaign) {
      createCampaign = <CreateCampaign createCampaign={this.handleCreateCampaign} closeModal={this.handleCloseModal} tokens={this.state.tokens} />;
    }

    return (
      <>
        <ReactNotification />
        {/* <ApolloProvider client={client}><Uniswap tokenIn={this.state.tokenIn} tokenOut={this.state.tokenOut} uniswapReturn={this.uniswapReturn} /></ApolloProvider> */}
        <div className="App">
          {modal}
          {createCampaign}
          <Header handlePress={this.handlePress} loginRegister={this.loginRegister} logout={this.logout} isLogged={this.state.isLogged} />
          <div className="content">
            <div className="list">
              {this.state.list.map((campaign, i) => {
                return <Campaign campaign={campaign} index={i} key={i} donation={this.handleDonation} accounts={this.state.accounts} ref={this._child} removeCampaign={this.removeCampaign} tokens={this.state.tokens} />;
              })}
            </div>
          </div>
          <footer></footer>
        </div>
      </>
    )
  }
}

export default App;
