<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { requireGameState, resetGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'

export default {
    data() {
        return {
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
            const gameState = requireGameState();
            gameState.setHostAddress(this.hostAddress);
            const playerAddress = gameState.getUserAddress();
            getMafiaContract().then(contract => {
                contract.joinGame(this.hostAddress, playerAddress).then(() => {
                    requireGameState().setHasJoined(true);
                    if (gameState.isHosting()) {
                        this.$router.push('/game/host');
                    } else {
                        this.$router.push('/game/join/waiting');
                    }
                }).catch(err => reportError("Failed to join game", err));
            }).catch(reportGetContractError)
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
</template>