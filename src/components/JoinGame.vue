<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { requireGameState, resetGameState } from '../js/game_state.js'
import { GameStarted, reportError, reportGetContractError } from '../js/errors.js'

export default {
    data() {
        return {
            gameAlreadyStarted: false,
            hostAddress: "",
            userNickname: "",
            userIsHost: false,
        };
    },

    methods: {
        cancel: function() {
            if (this.userIsHost) {
                getMafiaContract().then(contract => {
                    contract.cancelGame().then(() => {
                        resetGameState();
                    }).catch(err => reportError("Failed to cancel game", err))
                }).catch(reportGetContractError)
                .finally(() => {
                    this.$router.push('/landing');
                })
            } else {
                resetGameState();
                this.$router.push('/landing');
            }
        },
        joinGame: function() {
            getMafiaContract().then(contract => {
                const gameState = requireGameState();
                const playerAddress = gameState.getUserAddress();
                contract.joinGame(this.hostAddress, playerAddress).then(() => {
                    gameState.setHostAddress(this.hostAddress);
                    gameState.setHasJoined(true);
                    if (gameState.isHosting()) {
                        this.$router.push('/game/host');
                    } else {
                        this.$router.push('/game/join/waiting');
                    }
                }).catch(err => {
                    if (err === GameStarted) {
                        this.gameAlreadyStarted = true;
                    } else {
                        reportError("Failed to join game", err);
                    }
                });
            }).catch(reportGetContractError)
        },
        resumeGame: function() {
            const gameState = requireGameState();
            gameState.setHostAddress(this.hostAddress);
            gameState.setHasJoined(true);
            if (gameState.isHosting()) {
                this.$router.push('/game/play');
            } else {
                this.$router.push('/game/play');
            }
        }
    },

    mounted() {
        const gameState = requireGameState();
        this.userIsHost = gameState.isHosting();
        if (this.userIsHost) {
            this.hostAddress = gameState.getUserAddress();
        }

        // if they've already joined a game, then skip this step
        if (gameState.hasJoined()) {
            if (gameState.isHosting()) {
                this.$router.push('/game/host');
            } else {
                this.$router.push('/game/join/waiting');
            }
        }
    }
}

</script>

<template>
    <div v-if="!this.gameAlreadyStarted">
        Host address:
        <br />
        <input v-model="hostAddress" v-bind:readonly="this.userIsHost" />

        <p />

        Nickname:
        <br />
        <input v-model="userNickname" />

        <p />

        <button type="submit" @click="this.joinGame()">Join Game</button>
        <p />
        <button type="submit" @click="this.cancel()">Cancel</button>
    </div>
    <div v-if="this.gameAlreadyStarted">
        You are already participating in a game; do you wish to resume it?
        
        <p />

        <button type="submit" @click="this.resumeGame()">Join Game</button>
        <p />
        <button type="submit" @click="this.cancel()">Cancel</button>
    </div>
</template>