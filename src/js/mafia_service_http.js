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

    }

    getContractAddress() {
        // there is no contract address for pure HTTP communications
        return new Promise(resolve => resolve(""))
    }

    getPlayerID() {
        return new Promise(resolve => resolve(this.playerID))
    }

    initializeGame() {
        if (this.hostAddress) {
            throw "Game has already been initialized and cannot be initialized again";
        }

        this.hostAddress = this.playerID;

        return axios.post("http://localhost:3000/game/" + this.hostAddress)
    }

    uniqueID() {
        var array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return "" + array[0];
    }
}