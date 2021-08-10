const path = require('path')
const HDWalletProvider = require('truffle-hdwallet-provider')
const mnemonic = 'glue check pupil prefer lounge brother hawk wage plate bomb luxury gas'
const infuraProjectId = '92a23becb91d48d5b7ca23b757cd79a2'
const menmonicForked = 'until gaze carry chicken spoon curious toward spread price they easily fall'

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
  compilers: {
    solc: {
      version: '0.8.6',
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    develop: {
      port: 7545
    },
    rinkeby: {
      host: 'localhost',
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/' + infuraProjectId)
      },
      network_id: 4,
      gas: 6700000,
      gasPrice: 10000000000
    },
    forked: {
      host: 'localhost',
      provider: function () {
        return new HDWalletProvider(menmonicForked, 'http://graficketable.com:6545')
      },
      port: 8545,
      network_id: 1
    }
  },
  environments: {
    forked: {
      ipfs: {
        address: 'http://localhost:5001'
      },
      LinkToken: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      VRFCoordinator: '0xf0d54349aDdcf704F77AE15b96510dEA15cb7952',
      KeyHash: '0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445',
      Fee: 2
    },
  }
}
