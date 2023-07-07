import { Contract } from 'ethers'
import { GameAlreadyInitialized, GameStarted } from './errors.js'
import { getGameState } from './game_state.js';
import * as PlayerRole from './player_role.js'
import { ethers } from 'ethers'

let mafiaContract;

// getMafiaContract gets a MafiaContract, if it has been initialized, for interacting with the Mafia dapp.
// This returns a Promise that either resolves to an instance of MafiaContract or fails with the cause of an error.
export function getMafiaContract() {
  return new Promise((resolve, reject) => {
    if(mafiaContract) {
      resolve(mafiaContract);
      return;
    }
    
    // Try to re-initialize it from game state
    const gameState = getGameState();
    if (!gameState) {
      reject('Mafia contract has not been initialized');
      return;
    }

    const userAddress = gameState.getUserAddress();
    const provider = new ethers.BrowserProvider(ethereum);
    provider.getSigner(userAddress).then(signer => {
      const mafiaContract = initializeMafiaContract(gameState.getContractAddress(), signer);
      resolve(mafiaContract);
    }).catch(reject);
  })
}

// initializeMafiaContract sets the Mafia contract instancce to be used by the application.
// This returns the initialized MafiaContract instance.
export function initializeMafiaContract(contractAddress, signer) {
  const contract = new Contract(contractAddress, mafiaABI, signer)
  mafiaContract = new MafiaContract(contract, signer.address);
  return mafiaContract;
}

class MafiaContract {
  constructor(contract, signerAddress) {
    this.contract = contract;
    this.signerAddress = signerAddress;
  }

  // cancelGame returns a Promise that cancels an existing game
  cancelGame() {
    // Return a new promise to ensure that the transaction is submitted before continuing on.
    // Otherwise, funky things happen with the game state.
    return new Promise((resolve, reject) => {
      this.contract.cancelGame().then(resolve).catch(reject);
    })
  }

  // getPlayerRole gets the player's role in a game hosted by the given host address.
  getPlayerRole(hostAddress) {
    return new Promise((resolve, reject) => {
      this.contract.getSelfPlayerInfo(hostAddress).then(txResult => {
        const playerRole = txResult[4];
        switch(playerRole) {
          case 0n:
            resolve(PlayerRole.PlayerRoleCivilian);
          case 1n:
            resolve(PlayerRole.PlayerRoleMafia);
          default:
            reject(`unexpected player role return: ${playerRole}`);
        }
      }).catch(reject);
    })
  }

  // getPlayerNicknames returns a Promise that resolves to a Map of wallet addresses to nicknames
  getPlayerNicknames(hostAddress) {
    return new Promise((resolve, reject) => {
      this.contract.getPlayerList(hostAddress).then(items => {
        const map = new Map();
        for(let i = 0; i < items.length; i++) {
          const item = items[i];
          map.set(item[0], item[1]);
        }
        resolve(map);
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
          } else {
            reject(err);
          }
        });
      }).catch(reject);
    });
  }

  // joinGame returns a Promise that either resolves on a successful game join or rejects with the caught errors.
  // This can return GameStarted if the game has already been started.
  joinGame(hostAddress, playerNickname) {
    return new Promise((resolve, reject) => {
      this.contract.on(this.contract.filters.GameJoined(hostAddress, this.signerAddress), (h, p, e) => {
        resolve();
        e.removeListener();
      }).then(() => {
        this.contract.joinGame(hostAddress, playerNickname).then(tx => {
          tx.wait().catch(reject);
        }).catch(err => {
          if (("" + err).includes("a game cannot be joined while in progress")) {
            reject(GameStarted);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  // startGame returns a Promise that either resolves on a successful game start or rejects with the caught error.
  // This can return GameStarted if the game has already been started.
  startGame(expectedPlayerCount) {
    // TODO: listen for game started event
    return new Promise((resolve, reject) => {
      this.contract.startGame(expectedPlayerCount).then(tx => {
        tx.wait().then(() => {
          resolve();
        }).catch(reject);
      }).catch(err => {
        if (("" + err).includes("a game cannot be started while already in progress")) {
          reject(GameStarted);
        } else {
          reject(err);
        }
      });
    });
  }
}

const mafiaABI = [
  // functions
  "function cancelGame()",
  "function initializeGame()",
  "function getPlayerList(address hostAddress) view returns(tuple(address walletAddress, string nickname)[])",
  "function getSelfPlayerInfo(address hostAddress) view returns(tuple(address walletAddress, string nickname, bool dead, bool convicted, uint playerRole))",
  "function joinGame(address hostAddress, string playerNickName)",
  "function startGame(uint expectedPlayerCount)",
  // events
  "event GameInitialized(address indexed hostAddress)",
  "event GameJoined(address indexed hostAddress, address indexed playerAddress)",
  "event GameStarted(address indexed hostAddress)",
];