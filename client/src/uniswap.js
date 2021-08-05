import React, { useEffect } from 'react'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
// import uniswapLogo from '../uniswap-logo.png'
// import daiLogo from '../dai-logo.png'

export const client = new ApolloClient({
    link: new HttpLink({
        uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    }),
    fetchOptions: {
        mode: 'no-cors'
    },
    cache: new InMemoryCache()
})

const DAI_QUERY = gql`
  query tokens($tokenAddress: Bytes!) {
    tokens(where: { id: $tokenAddress }) {
      derivedETH
      totalLiquidity
    }
  }
`

const ETH_PRICE_QUERY = gql`
  query bundles {
    bundles(where: { id: "1" }) {
      ethPrice
    }
  }
`

function Uniswap(props) {
    const { loading: ethLoading, data: ethPriceData } = useQuery(ETH_PRICE_QUERY)
    const { loading: daiLoading, data: daiData } = useQuery(DAI_QUERY, {
        variables: {
            tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f'
        }
    })

    const daiPriceInEth = daiData && daiData.tokens[0].derivedETH
    const daiTotalLiquidity = daiData && daiData.tokens[0].totalLiquidity
    const ethPriceInUSD = ethPriceData && ethPriceData.bundles[0].ethPrice

    if (daiPriceInEth && ethPriceInUSD) props.uniswapReturn({
        dai: daiPriceInEth ,
        eth: ethPriceInUSD
    })

    return (
        <>
            <h2>
                Dai price:{' '}
                {ethLoading || daiLoading
                    ? 'Loading token data...'
                    : '$' +
                    // parse responses as floats and fix to 2 decimals
                    (parseFloat(daiPriceInEth) * parseFloat(ethPriceInUSD)).toFixed(2)}
            </h2>
            <h2>
                Dai total liquidity:{' '}
                {daiLoading
                    ? 'Loading token data...'
                    : // display the total amount of DAI spread across all pools
                    parseFloat(daiTotalLiquidity).toFixed(0)}
            </h2>

        </>
    );
}

export default Uniswap