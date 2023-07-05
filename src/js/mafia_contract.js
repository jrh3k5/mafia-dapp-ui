import Web3 from 'web3'

// getMafiaContract gets an object that can be used to interact with the Mafia dapp contract
export function getMafiaContract(nodeURL, contractAddress) {
    const web3 = new Web3(nodeURL);
    return web3.eth.Contract(mafiaABI, contractAddress);
}

const mafiaABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "hostAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "accused",
          "type": "address"
        }
      ],
      "name": "accuseAsMafia",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cancelGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "executePhase",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "finishGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGameState",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "hostAddress",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "running",
              "type": "bool"
            },
            {
              "internalType": "address[]",
              "name": "playerAddresses",
              "type": "address[]"
            },
            {
              "internalType": "enum Mafia.TimeOfDay",
              "name": "currentPhase",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "mafiaPlayerCount",
              "type": "uint256"
            },
            {
              "internalType": "enum Mafia.PhaseOutcome",
              "name": "lastPhaseOutcome",
              "type": "uint8"
            },
            {
              "internalType": "address[]",
              "name": "convictedPlayers",
              "type": "address[]"
            },
            {
              "internalType": "address[]",
              "name": "killedPlayers",
              "type": "address[]"
            }
          ],
          "internalType": "struct Mafia.GameState",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPlayers",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "nickname",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "dead",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "convicted",
              "type": "bool"
            },
            {
              "internalType": "enum Mafia.PlayerRole",
              "name": "playerRole",
              "type": "uint8"
            }
          ],
          "internalType": "struct Mafia.Player[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "hostAddress",
          "type": "address"
        }
      ],
      "name": "getSelfPlayerInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "walletAddress",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "nickname",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "dead",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "convicted",
              "type": "bool"
            },
            {
              "internalType": "enum Mafia.PlayerRole",
              "name": "playerRole",
              "type": "uint8"
            }
          ],
          "internalType": "struct Mafia.Player",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initializeGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "hostAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "playerNickname",
          "type": "string"
        }
      ],
      "name": "joinGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "expectedPlayerCount",
          "type": "uint256"
        }
      ],
      "name": "startGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "hostAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "victimAddress",
          "type": "address"
        }
      ],
      "name": "voteToKill",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];