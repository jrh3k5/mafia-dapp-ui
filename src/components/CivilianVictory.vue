<script>
import { getMafiaService } from '../js/mafia_service.js'
import { getGameState, clearGameState } from '../js/game_state.js'
import { handleMafiaServiceProviderError, handleMountError, reportError } from '../js/errors.js'
import { setLoading } from '../js/loading'

export default {
    data() {
        return {
            isHosting: null,
        }
    },

    methods: {
        finishGame: function() {
            setLoading(true);

            getMafiaService().then(mafiaService => {
                mafiaService.finishGame().then(() => {
                    clearGameState();
                    this.$router.push({ name: 'Root' });
                }).catch(err => reportError("Failed to finish game", err))
                  .finally(() => setLoading(false));
            }).catch(err => handleMafiaServiceProviderError(err, this));
        },
        playAgain: function() {
            clearGameState();
            this.$router.push({ name: 'Root' });
        },
    },

    mounted() {
        setLoading(true);

        getGameState().then(gameState => {
            this.isHosting = gameState.isHosting();
        }).catch(err => handleMountError(err, this))
          .finally(() => setLoading(false));
    }
}

</script>
<template>
The Civilians have won! The city has cast off the shackles of organized crime.

<button type="submit" @click="this.playAgain()" v-if="this.isHosting === false">Play Again</button>

<button type="submit" @click="this.finishGame()" v-if="this.isHosting">Close Game</button>

</template>