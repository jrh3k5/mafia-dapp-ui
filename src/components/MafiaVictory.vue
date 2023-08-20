<script>
import { getMafiaService } from '../js/mafia_service.js'
import { getGameState, clearGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'

export default {
    data() {
        return {
            isHosting: null,
        }
    },

    methods: {
        finishGame: function() {
            getMafiaService().then(mafiaService => {
                mafiaService.finishGame().then(() => {
                    clearGameState();
                    this.$router.push('./');
                }).catch(err => reportError("Failed to finish game", err));
            }).catch(reportGetContractError);
        },
        playAgain: function() {
            clearGameState();
            this.$router.push('./');
        },
    },

    mounted() {
        getGameState().then(gameState => {
            this.isHosting = gameState.isHosting();
        }).catch(err => reportError("Failed to get game state on initialization", err))
    }
}

</script>
<template>
The Mafia won! The city has succumbed to organized crime and the remaining civilians are held tightly within its grasp.

<button type="submit" @click="this.playAgain()" v-if="this.isHosting === false">Play Again</button>

<button type="submit" @click="this.finishGame()" v-if="this.isHosting">Close Game</button>

</template>