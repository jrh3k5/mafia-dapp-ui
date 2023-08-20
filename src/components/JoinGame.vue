<script>
import { getMafiaService } from '../js/mafia_service.js'
import { getGameState, resetGameState } from '../js/game_state.js'
import { GameStarted, reportError, reportGetContractError } from '../js/errors.js'

export default {
    data() {
        return {
            gameAlreadyStarted: false,
            hostAddress: "",
            userNickname: "",
            userIsHost: false,
            waitingForStart: false,
        };
    },

    methods: {
        cancel: function() {
            if (this.userIsHost) {
                getMafiaService().then(mafiaService => {
                    mafiaService.cancelGame().then(() => {
                        resetGameState();
                        this.$router.push({ name: 'Landing' });
                    }).catch(err => reportError("Failed to cancel game", err))
                }).catch(reportGetContractError);
            } else {
                resetGameState();
                this.$router.push({ name: 'Landing' });
            }
        },
        joinGame: function() {
            getMafiaService().then(mafiaService => {
                mafiaService.joinGame(this.hostAddress, this.userNickname).then(() => {
                    getGameState().then(gameState => {
                        gameState.setHostAddress(this.hostAddress);
                        gameState.setHasJoined(true);
                        if (gameState.isHosting()) {
                            this.$router.push({ name: 'HostGame' });
                        } else {
                            // tell the user that they're waiting for the host to begin the game
                            this.waitingForStart = true;

                            mafiaService.waitForGameStart(this.hostAddress).then(() => {
                                this.$router.push({ name: 'PlayCard' });
                            }).catch(err => reportError("Failed to start waiting for game to start", err))
                        }
                    }).catch(err => reportError("Failed to get game state on joining", err))
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
            getGameState().then(gameState => {
                gameState.setHostAddress(this.hostAddress);
                gameState.setHasJoined(true);
                if (gameState.isHosting()) {
                    this.$router.push({ name: 'PlayCard' });
                } else {
                    this.$router.push({ name: 'PlayCard' });
                }
            }).catch(err => reportError("Failed to get game state while resuming game", err))
        }
    },

    mounted() {
        getGameState().then(gameState => {
            this.userIsHost = gameState.isHosting();
            if (this.userIsHost) {
                this.hostAddress = gameState.getPlayerAddress();
            }

            // if they've already joined a game, then skip this step
            if (gameState.hasJoined()) {
                // TODO: handle when the game has not yet been started
                this.$router.push({ name: 'PlayCard' });
            }
        }).catch(err => reportError("Failed to get game state on initialization", err))
    }
}

</script>

<template>
    <div v-if="!this.gameAlreadyStarted">
        <div v-if="!this.waitingForStart">
            <label for="host-address">Host address:</label>
            <input id="host-address" v-model="hostAddress" v-bind:readonly="this.userIsHost" />

            <label for="player-nickname">Nickname:</label>
            <input id="player-nickname" v-model="userNickname" />

            <button type="submit" @click="this.joinGame()">Join Game</button>

            <button type="submit" @click="this.cancel()">Cancel</button>
        </div>
        <div v-if="this.waitingForStart">
            You are joined to the game. When the game has started, you will be automatically taken to your play card.
        </div>
    </div>
    <div v-if="this.gameAlreadyStarted">
        You are already participating in a game; do you wish to resume it?
        
        <button type="submit" @click="this.resumeGame()">Resume Game</button>

        <button type="submit" @click="this.cancel()">Cancel</button>
    </div>
</template>