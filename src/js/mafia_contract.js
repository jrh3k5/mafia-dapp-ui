import { Contract } from 'ethers';

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
    mafiaContract = new MafiaContract(new Contract(contractAddress, mafiaABI, signer));
}

class MafiaContract {
  constructor(contract) {
    this.contract = contract;
  }

  // initializeGame returns a Promise to begin a game
  initializeGame() {
    return new Promise((resolve, reject) => {
      this.contract.initializeGame().then(tx => {
        tx.wait().then(() => {
          resolve();
        }).catch(reject);
      }).catch(reject);
    });
  }

  startGame(expectedPlayerCount) {
    return new Promise((resolve, reject) => {
      this.contract.startGame(expectedPlayerCount).then(tx => {
        tx.wait().then(() => {
          resolve();
        }).catch(reject);
      }).catch(reject);
    });
  }
}

const mafiaABI = [
  "function initializeGame() public",
  "function startGame(uint expectedPlayerCount) public",
];