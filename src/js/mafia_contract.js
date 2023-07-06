import { Contract } from 'ethers';
import { GameAlreadyInitialized } from './errors.js';

let mafiaContract;

// getMafiaContract gets a MafiaContract, if it has been initialized, for interacting with the Mafia dapp
export function getMafiaContract() {
  if (!mafiaContract) {
    throw 'Mafia contract has not been initialized';
  }
  return mafiaContract;
}

// initializeMafiaContract sets the Mafia contract instancce to be used by the application
export function initializeMafiaContract(contractAddress, signer) {
  const contract = new Contract(contractAddress, mafiaABI, signer)
  mafiaContract = new MafiaContract(contract, signer.address);
}

class MafiaContract {
  constructor(contract, signerAddress) {
    this.contract = contract;
    this.signerAddress = signerAddress;
  }

  // cancelGame returns a Promise that cancels an existing game
  cancelGame() {
    return this.contract.cancelGame();
  }

  // initializeGame returns a Promise to begin a game
  initializeGame() {
    return new Promise((resolve, reject) => {
      this.contract.on(this.contract.filters.GameInitialized(this.signerAddress), (_, event) => {
        resolve();
        event.removeListener();
      }).then(() => {
        this.contract.initializeGame().then(tx => {
          tx.wait().then(console.log).catch(reject);
        }).catch(err => {
          if (("" + err).includes("a game cannot be initialized while you are hosting another")) {
            reject(GameAlreadyInitialized)
          }
        });
      }).catch(reject);
    });
  }

  startGame(expectedPlayerCount) {
    return new Promise((resolve, reject) => {
      this.contract.startGame(expectedPlayerCount).then(tx => {
        tx.wait().then(console.log).then(() => {
          // TODO: listen for game started event
          resolve();
        }).catch(reject);
      }).catch(reject);
    });
  }
}

const mafiaABI = [
  // functions
  "function cancelGame() public",
  "function initializeGame() public",
  "function startGame(uint expectedPlayerCount) public",
  // events
  "event GameInitialized(address indexed hostAddress)",
  "event GameJoined(address indexed hostAddress, address indexed playerAddress)",
  "event GameStarted(address indexed hostAddress)",
];