import { isDevelopment } from './environment.js'

// SupportedChain describes a chain that is supported by this game
export class SupportedChain {
    constructor(name, chainID, contractAddress) {
        this.name = name;
        this.chainID = chainID;
        this.contractAddress = contractAddress;
    }
}

const BaseGoerliTestnet = new SupportedChain("Base Goerli", 84531n, "0x25ba57bb0371488E794EE631533609D3eC1F92c4");

const Hardhat = new SupportedChain("Hardhat", 31337n, "0x25ba57bb0371488E794EE631533609D3eC1F92c4");

// getSupportedChains gets the chains that are supported for blockchain communications.
// This returns a Promise that resolves to an array of SupportedChain objects.
export function getSupportedChains() {
    return new Promise(resolve => {
        const supportedNetworks = [BaseGoerliTestnet];
        if (isDevelopment()) {
            supportedNetworks.push(Hardhat);
        }

        resolve(supportedNetworks);
    })
}