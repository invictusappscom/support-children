const DEFAULT_IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
import IPFS from 'ipfs-http-client';

class NftStorageService {
  static _client = IPFS.create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: 'http'
  })

  static storeNft (name, description, image) {
    const imgIpfsResult = await this._client.add(image);

    const imageCid = this.formatIpfsCid(imgIpfsResult.cid);
    const finalObject = {
      name,
      description,
      image: imageCid
    }

    const finalIpfsResult = await this._client.add(JSON.stringify(finalObject));

    return {
      metadata: this.formatIpfsCid(finalIpfsResult.cid),
      img: imageCid
    };
  }

  static formatIpfsCid(cid) {
    return `ipfs://${cid.toString()}`
  }

  static parseNftLink(url, gatewayUrl = DEFAULT_IPFS_GATEWAY) {
    const result = RegExp("(?<=ipfs://).*$").exec(url);

    return gatewayUrl + result;
  }
}

export default NftStorageService;
