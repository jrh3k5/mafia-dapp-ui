import { GameAlreadyInitialized, GameAlreadyJoined, GameStarted, TransactionSignatureRejected } from './errors.js'
import * as PlayerRole from './player_role.js'
import * as PhaseOutcome from './phase_outcome.js'
import * as TimeOfDay from './time_of_day.js'
import { Contract } from 'ethers'

// getMafiaContractProvider gets a Promise that can resolve to a MafiaContract instance.
export function getMafiaContractProvider(ethersProvider, playerAddress, contractAddress) {
  let mafiaContractHolder;
  return function() {
    return new Promise((resolve, reject) => {
      if(mafiaContractHolder) {
        resolve(mafiaContractHolder);
        return;
      }
  
      ethersProvider.getSigner(playerAddress).then(signer => {
        const ethersContract = new Contract(contractAddress, mafiaABI, signer);
        const mafiaContract = new MafiaContract(ethersContract, playerAddress);
        mafiaContractHolder = mafiaContract;
        resolve(mafiaContract);
      }).catch(err => reject(this.handleTransactionError(err)));
    })
  }
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
        txResult.wait().then(resolve).catch(err => reject(this.handleTransactionError(err)));
      }).catch(err => reject(this.handleTransactionError(err)));
    })
  }

  // cancelGame returns a Promise that cancels an existing game
  cancelGame() {
    // Return a new promise to ensure that the transaction is submitted before continuing on.
    // Otherwise, funky things happen with the game state.
    return new Promise((resolve, reject) => {
      this.contract.cancelGame().then(resolve).catch(err => reject(this.handleTransactionError(err)));
    })
  }

  // executePhase executes the current phase, tallying votes and applying them
  executePhase() {
    return new Promise((resolve, reject) => {
      this.contract.executePhase().then(txResult => {
        txResult.wait().then(resolve).catch(err => reject(this.handleTransactionError(err)));
      }).catch(err => reject(this.handleTransactionError(err)));
    })
  }

  finishGame() {
    return new Promise((resolve, reject) => {
      this.contract.finishGame().then(txResult => {
        txResult.wait().then(resolve).catch(err => reject(this.handleTransactionError(err)));
      }).catch(err => reject(this.handleTransactionError(err)));
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
      }).catch(err => reject(this.handleTransactionError(err)));
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
      }).catch(err => reject(this.handleTransactionError(err)));
    })
  }

  handleTransactionError(err) {
    if (this.isTransactionSignatureRejection(err)) {
      return TransactionSignatureRejected;
    }

    return err;
  }

  // initializeGame returns a Promise to begin a game
  initializeGame() {
    return new Promise((resolve, reject) => {
      this.contract.on(this.contract.filters.GameInitialized(this.signerAddress), (_, event) => {
        resolve();
        event.removeListener();
      }).then(() => {
        this.contract.initializeGame().then(tx => {
          tx.wait().catch(err => reject(this.handleTransactionError(err)));
        }).catch(err => {
          if (("" + err).includes("a game cannot be initialized while you are hosting another")) {
            reject(GameAlreadyInitialized)
          } else if (this.isTransactionSignatureRejection(err)) {
            reject(TransactionSignatureRejected);
          } else {
            reject(err);
          }
        });
      }).catch(err => reject(this.handleTransactionError(err)));
    });
  }

  // isTransactionSignatureRejection determines if the error is a result of the user rejecting
  // a signature request.
  isTransactionSignatureRejection(err) {
    return ("" + err).includes("denied transaction signature");
  }

  // joinGame returns a Promise that either resolves on a successful game join or rejects with the caught errors.
  // This can return GameStarted if the game has already been started.
  joinGame(hostAddress, playerNickname) {
    return new Promise((resolve, reject) => {
      this.contract.once(this.contract.filters.GameJoined(hostAddress, this.signerAddress), () => {
        resolve();
      }).then(() => {
        this.contract.joinGame(hostAddress, playerNickname).then(tx => {
          tx.wait().catch(err => reject(this.handleTransactionError(err)));
        }).catch(err => {
          if (("" + err).includes("a game cannot be joined while in progress")) {
            reject(GameStarted);
          } else if (("" + err).includes("a game cannot be joined again")) {
            reject(GameAlreadyJoined);
          } else if (this.isTransactionSignatureRejection(err)) {
            reject(TransactionSignatureRejected);
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
        }).catch(err => reject(this.handleTransactionError(err)));
      }).catch(err => {
        if (("" + err).includes("a game cannot be started while already in progress")) {
          reject(GameStarted);
        } else if (this.isTransactionSignatureRejection(err)) {
          reject(TransactionSignatureRejected);
        } else {
          reject(err);
        }
      });
    });
  }

  voteToKill(hostAddres, victimAddress) {
    return new Promise((resolve, reject) => {
      this.contract.voteToKill(hostAddres, victimAddress).then(txResult => {
        txResult.wait().then(resolve).catch(err => reject(this.handleTransactionError(err)));
      }).catch(err => reject(this.handleTransactionError(err)))
    })
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
      }).catch(err => reject(this.handleTransactionError(err)));
    })
  }

  // waitForGameStart waits for a game started by the given host address
  waitForGameStart(hostAddress) {
    return new Promise((resolve, reject) => {
      this.contract.once(this.contract.filters.GameStarted(hostAddress), resolve).catch(err => reject(this.handleTransactionError(err)));
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
  "function voteToKill(address hostAddress, address victimAddress)",
  // events
  "event GameInitialized(address indexed hostAddress)",
  "event GameJoined(address indexed hostAddress, address indexed playerAddress)",
  "event GameStarted(address indexed hostAddress)",
  "event GamePhaseExecuted(address indexed hostAddress, uint phaseOutcome, uint timeOfDay, address[] playersKilled, address[] playersConvicted)",
];