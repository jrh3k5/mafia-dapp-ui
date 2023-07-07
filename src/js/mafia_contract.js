import { Contract } from 'ethers'
import { GameAlreadyInitialized } from './errors.js'
import * as PlayerRole from './player_role.js'

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

  // getPlayerRole gets the player's role in a game hosted by the given host address.
  getPlayerRole(hostAddress) {
    return new Promise((resolve, reject) => {
      // TODO: call, don't send transaction, as this is a view, not a mutation of contract state
      this.contract.getSelfPlayerInfo(hostAddress).then(txResult => {
        console.log("txResult", txResult);
        const playerRole = txResult[4];
        switch(playerRole) {
          case 0n:
            return PlayerRole.PlayerRoleCivilian;
          case 1n:
            return PlayerRole.PlayerRoleMafia;
          default:
            reject(`unexpected player role return: ${playerRole}`);
        }
      }).catch(reject);
    })
  }

  // initializeGame returns a Promise to begin a game
  initializeGame() {
    return new Promise((resolve, reject) => {
      this.contract.on(this.contract.filters.GameInitialized(this.signerAddress), (_, event) => {
        resolve();
        event.removeListener();
      }).then(() => {
        this.contract.initializeGame().then(tx => {
          tx.wait().catch(reject);
        }).catch(err => {
          if (("" + err).includes("a game cannot be initialized while you are hosting another")) {
            reject(GameAlreadyInitialized)
          }
        });
      }).catch(reject);
    });
  }

  joinGame(hostAddress, playerAddress) {
    return new Promise((resolve, reject) => {
      this.contract.on(this.contract.filters.GameJoined(hostAddress, playerAddress), (h, p, e) => {
        resolve();
        e.removeListener();
      }).then(() => {
        this.contract.joinGame(hostAddress, playerAddress).then(tx => {
          tx.wait().catch(reject);
        }).catch(reject);
      });
    });
  }

  startGame(expectedPlayerCount) {
    return new Promise((resolve, reject) => {
      this.contract.startGame(expectedPlayerCount).then(tx => {
        tx.wait().then(() => {
          // TODO: listen for game started event
          resolve();
        }).catch(reject);
      }).catch(reject);
    });
  }
}

const mafiaABI = [
  // functions
  "function cancelGame()",
  "function initializeGame()",
  "function getSelfPlayerInfo(address hostAddress) view returns(tuple(address walletAddress, string nickname, bool dead, bool convicted, uint playerRole))",
  "function joinGame(address hostAddress, string playerNickName)",
  "function startGame(uint expectedPlayerCount)",
  // events
  "event GameInitialized(address indexed hostAddress)",
  "event GameJoined(address indexed hostAddress, address indexed playerAddress)",
  "event GameStarted(address indexed hostAddress)",
];