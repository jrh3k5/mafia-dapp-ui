<script>
import { getMafiaService } from '../js/mafia_service.js'
import { getGameState, resetGameState } from '../js/game_state.js'
import { GameStarted, reportError, reportGetContractError } from '../js/errors.js'
import { setLoading } from '../js/loading.js'

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
                setLoading(true);

                getMafiaService().then(mafiaService => {
                    mafiaService.cancelGame().then(() => {
                        resetGameState();
                        this.$router.push({ name: 'Landing' });
                    }).catch(err => reportError("Failed to cancel game", err))
                      .finally(() => setLoading(false));
                }).catch(reportGetContractError);
            } else {
                resetGameState();
                this.$router.push({ name: 'Landing' });
            }
        },
        joinGame: function() {
            setLoading(true);

            getMafiaService().then(mafiaService => {
                mafiaService.joinGame(this.hostAddress, this.userNickname).then(() => {
                    getGameState().then(gameState => {
                        // clear the loading indicator so that the waiting message can be shown to the user
                        setLoading(false);

                        gameState.setHostAddress(this.hostAddress);
                        gameState.setHasJoined(true);
                        if (gameState.isHosting()) {
                            this.$router.push({ name: 'HostGame' });
                        } else {
                            // tell the user that they're waiting for the host to begin the game
                            this.waitingForStart = true;

                            mafiaService.waitForGameStart(this.hostAddress).then(() => {
                                this.$router.push({ name: 'PlayCard' });
                            }).catch(err => reportError("Failed to start waiting for game to start", err));
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
        }
    },

    mounted() {
        setLoading(true);

        getGameState().then(gameState => {
            this.userIsHost = gameState.isHosting();
            if (this.userIsHost) {
                this.hostAddress = gameState.getPlayerAddress();
            }
        }).catch(err => reportError("Failed to get game state on initialization", err))
          .finally(() => setLoading(false));
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
        This game has already started and cannot be joined.
        
        <button type="submit" @click="this.cancel()">Cancel</button>
    </div>
</template>