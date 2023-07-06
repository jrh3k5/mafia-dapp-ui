<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { getGameState, resetGameState } from '../js/game_state.js'
import { reportError } from '../js/errors.js'

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
                getMafiaContract().cancelGame().then(() => {
                    resetGameState();
                }).catch(err => reportError("Failed to cancel game", err))
                .finally(() => {
                    this.$router.push('/landing');
                })
            }
        },
        joinGame: function() {
            const gameState = getGameState();
            const playerAddress = gameState.getUserAddress();
            getMafiaContract().joinGame(this.hostAddress, playerAddress).then(() => {
                if (gameState.isHosting()) {
                    this.$router.push('/game/host');
                } else {
                    // TODO: take the user to the player interstitial page
                }
            }).catch(err => reportError("Failed to join game", err));
        }
    },

    mounted() {
        const gameState = getGameState();
        this.userIsHost = gameState.isHosting();
        if (this.userIsHost) {
            this.hostAddress = gameState.getUserAddress();
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