import { CONFIG } from './index';

const { NETWORK_ID, INFURA_PROJECT_ID } = CONFIG;

export const WEB3_OPTS = {
    networkId: NETWORK_ID,
    websocketProvider: 'wss://rinkeby.infura.io/ws/v3/' + INFURA_PROJECT_ID
}