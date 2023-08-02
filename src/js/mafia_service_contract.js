import { Contract } from 'ethers'
import { GameAlreadyInitialized, GameStarted } from './errors.js'
import { getGameState } from './game_state.js';
import * as PlayerRole from './player_role.js'
import { ethers } from 'ethers'
import * as PhaseOutcome from './phase_outcome.js'
import * as TimeOfDay from './time_of_day.js'

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
    getGameState().then(gameState => {
      if (!gameState) {
        reject('Mafia contract has not been initialized');
        return;
      }
  
      const userAddress = gameState.getPlayerAddress();
      const provider = new ethers.BrowserProvider(ethereum);
      provider.getSigner(userAddress).then(signer => {
        const mafiaContract = initializeMafiaContract(gameState.getContractAddress(), signer);
        resolve(mafiaContract);
      }).catch(reject);
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

  // accuseAsMafia accuses a player at the given address in a game hosted by a player identified by the given address as Mafia.
  // It returns a Promise that rejects if the accusation fails and resolves if the accusation is accepted.
  accuseAsMafia(hostAddress, accusedAddress) {
    return new Promise((resolve, reject) => {
      this.contract.accuseAsMafia(hostAddress, accusedAddress).then(txResult => {
        txResult.wait().then(resolve).catch(reject);
      }).catch(reject);
    })
  }

  // cancelGame returns a Promise that cancels an existing game
  cancelGame() {
    // Return a new promise to ensure that the transaction is submitted before continuing on.
    // Otherwise, funky things happen with the game state.
    return new Promise((resolve, reject) => {
      this.contract.cancelGame().then(resolve).catch(reject);
    })
  }

  // executePhase executes the current phase, tallying votes and applying them
  executePhase() {
    return new Promise((resolve, reject) => {
      this.contract.executePhase().then(txResult => {
        txResult.wait().then(resolve).catch(reject);
      }).catch(reject);
    })
  }

  finishGame() {
    return new Promise((resolve, reject) => {
      this.contract.finishGame().then(txResult => {
        txResult.wait().then(resolve).catch(reject);
      }).catch(reject);
    })
  }

  getContractAddress() {
    return new Promise(resolve => resolve(this.contractAddress))
  }

  getPlayerID() {
    return new Promise(resolve => resolve(this.signerAddress))
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
      this.contract.once(this.contract.filters.GameJoined(hostAddress, this.signerAddress), () => {
        resolve();
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

  // waitForPhaseExecution waits for the emission of an event indicating that a phase
  // has been executed for a game hosted by the given address. When the returned promise resolves, it will return:
  // - an enum of the outcome of the phase execution
  // - an enum for the time of day that was executed
  // - an array of the wallet addresses of players who were killed (if any)
  // - an array of the wallet addresses of players who were convicted as Mafia (if any)
  waitForPhaseExecution(hostAddress) {
    return new Promise((resolve, reject) => {
      this.contract.once(this.contract.filters.GamePhaseExecuted(hostAddress), contractPayload => {
        const phaseOutcomeInt = contractPayload.args[1];
        const timeOfDayInt = contractPayload.args[2];
        const killed = contractPayload.args[3];
        const convicted = contractPayload.args[4];

        let phaseOutcome;
        switch (phaseOutcomeInt) {
          case 0n:
            phaseOutcome = PhaseOutcome.PhaseOutcomeContinuation;
            break;
          case 1n:
            phaseOutcome = PhaseOutcome.PhaseOutcomeCivilianVictory;
            break;
          case 2n:
            phaseOutcome = PhaseOutcome.PhaseOutcomeMafiaVictory;
            break;
          default:
            reject(`unexpected int phase outcome value while listening for phase execution: ${phaseOutcomeInt}`);
            return;
        }

        let timeOfDay;
        switch (timeOfDayInt) {
          case 0n:
            timeOfDay = TimeOfDay.TimeOfDayDay;
            break;
          case 1n:
            timeOfDay = TimeOfDay.TimeOfDayNight;
            break;
          default:
            reject(`unexpected int time of day value while listening for phase execution: ${timeOfDayInt}`);
            return;
        }

        resolve([phaseOutcome, timeOfDay, killed, convicted]);
      }).catch(reject);
    })
  }

  // waitForGameStart waits for a game started by the given host address
  waitForGameStart(hostAddress) {
    return new Promise((resolve, reject) => {
      this.contract.once(this.contract.filters.GameStarted(hostAddress), resolve).catch(reject);
    })
  }
}

const mafiaABI = [
  // functions
  "function accuseAsMafia(address hostAddress, address accused)",
  "function cancelGame()",
  "function executePhase()",
  "function initializeGame()",
  "function finishGame()",
  "function getPlayerList(address hostAddress) view returns(tuple(address walletAddress, string nickname)[])",
  "function getSelfPlayerInfo(address hostAddress) view returns(tuple(address walletAddress, string nickname, bool dead, bool convicted, uint playerRole))",
  "function joinGame(address hostAddress, string playerNickName)",
  "function startGame(uint expectedPlayerCount)",
  // events
  "event GameInitialized(address indexed hostAddress)",
  "event GameJoined(address indexed hostAddress, address indexed playerAddress)",
  "event GameStarted(address indexed hostAddress)",
  "event GamePhaseExecuted(address indexed hostAddress, uint phaseOutcome, uint timeOfDay, address[] playersKilled, address[] playersConvicted)",
];