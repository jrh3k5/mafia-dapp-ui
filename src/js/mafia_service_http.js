import * as PhaseOutcome from './phase_outcome.js'
import * as PlayerRole from './player_role.js'
import * as TimeOfDay from './time_of_day.js'
import axios from 'axios'

let mafiaService

export function getMafiaHTTPService() {
    return new Promise(resolve => {
        if (!mafiaService) {
            mafiaService = new MafiaService()
        }
        resolve(mafiaService)
    })
}

class MafiaService {
    constructor() {
        this.playerID = this.uniqueID()
    }

    accuseAsMafia(hostAddress, accusedAddress) {
        return axios.post(`http://localhost:3000/game/${hostAddress}/players/${this.playerID}/vote/accuse?playerAddress=${accusedAddress}`)
    }

    cancelGame() {
        return axios.delete(`http://localhost:3000/game/${this.hostAddress}`)
    }

    executePhase() {
        return axios.post(`http://localhost:3000/game/${this.hostAddress}/phase/execute`)
    }

    getContractAddress() {
        // there is no contract address for pure HTTP communications
        return new Promise(resolve => resolve(""))
    }

    getPlayerID() {
        return new Promise(resolve => resolve(this.playerID))
    }

    getPlayerRole(hostAddress) {
        return new Promise((resolve, reject) => {
            axios.get(`http://localhost:3000/game/${hostAddress}/players/${this.playerID}`).then(response => {
                console.log("getPlayerRole response", response);
                if (!response.data.playerRole && response.data.playerRole !== 0) {
                    reject("no player role found in response");
                    return;
                }

                switch(response.data.playerRole) {
                    case 0:
                        resolve(PlayerRole.PlayerRoleCivilian);
                        break;
                    case 1:
                        resolve(PlayerRole.PlayerRoleMafia);
                        break;
                    default:
                        reject(`unknown player role value: ${response.data.playerRole}`)
                }
            }).catch(reject);
        })
    }

    getPlayerNicknames(hostAddress) {
        return new Promise((resolve, reject) => {
            axios.get(`http://localhost:3000/game/${hostAddress}/players`).then(response => {
                const map = new Map();
                response.data.forEach(player => {
                    map.set(player.playerAddress, player.playerNickname)
                })
                resolve(map);
            }).catch(reject);
        })
    }

    initializeGame() {
        if (this.hostAddress) {
            throw "Game has already been initialized and cannot be initialized again";
        }

        this.hostAddress = this.playerID;

        return axios.post("http://localhost:3000/game/" + this.hostAddress)
    }

    joinGame(hostAddress, playerNickname) {
        return axios.post(`http://localhost:3000/game/${hostAddress}/join?playerAddress=${this.playerID}&playerNickname=${playerNickname}`)
    }

    startGame() {
        // don't have to worry about block synchronization, so don't enforce expected player count
        return axios.post(`http://localhost:3000/game/${this.hostAddress}/start`)
    }

    waitForPhaseExecution(hostAddress) {
        return new Promise((resolve, reject) => {
            axios.get(`http://localhost:3000/game/${hostAddress}/phase/wait`).then(response => {
                let phaseOutcome;
                switch(response.data.phaseOutcome) {
                    case 0:
                        phaseOutcome = PhaseOutcome.PhaseOutcomeContinuation;
                        break;
                    case 1:
                        phaseOutcome = PhaseOutcome.PhaseOutcomeCivilianVictory;
                        break;
                    case 2:
                        phaseOutcome = PhaseOutcome.PhaseOutcomeMafiaVictory;
                        break;
                    default:
                        reject(`unexpected phase outcome value: ${response.data.phaseOutcome}`)
                        return;
                }

                let timeOfDay;
                switch(response.data.currentPhase) {
                    case 0:
                        timeOfDay = TimeOfDay.TimeOfDayDay;
                        break;
                    case 1:
                        timeOfDay = TimeOfDay.TimeOfDayNight;
                        break;
                    default:
                        reject(`unexpected time of day value: ${response.data.timeOfDay}`)
                        return;
                }

                resolve([phaseOutcome, timeOfDay, response.data.killedPlayers, response.data.convictedPlayers]);
            }).catch(reject);
        })
    }

    waitForGameStart(hostAddress) {
        return axios.get(`http://localhost:3000/game/${hostAddress}/start/wait`)
    }

    uniqueID() {
        var array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return "" + array[0];
    }
}