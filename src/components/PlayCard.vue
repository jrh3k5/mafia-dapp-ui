<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { requireGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'
import * as PlayerRole from '../js/player_role.js'
import { ResolverMethodMissingError } from 'web3'

export default {
    data() {
        return {
            isMafia: false,
            isCivilian: false,
            playerNicknames: null,
        }
    },

    mounted() {
        const hostAddress = requireGameState().getHostAddress();
        if (!hostAddress) {
            reportError("No host address could be retrieved from the game state; you will be taken to the main page now to restart your game", null);
            this.$router.push('/landing');
            return;
        }

        getMafiaContract().then(contract => {
            contract.getPlayerRole(hostAddress).then(playerRole => {
                this.isMafia = playerRole === PlayerRole.PlayerRoleMafia;
                this.isCivilian = playerRole === PlayerRole.PlayerRoleCivilian;
            }).catch(err => reportError("Failed to get player's information", err));

            contract.getPlayerNicknames(hostAddress).then(playerNicknames => {
                this.playerNicknames = playerNicknames;
            }).catch(err => reportError("Failed to get player nickname map", err));
        }).catch(reportGetContractError);
    }
}
</script>

<template>
    <div v-if="this.isMafia">
        You are MAFIA.
    </div>
    <div v-if="this.isCivilian">
        You are a CIVILIAN.
    </div>

    <div v-if="this.playerNicknames">
        <div v-for="[walletAddress, playerNickname] in this.playerNicknames">
            {{ walletAddress }} => {{ playerNickname }}
        </div> 
    </div>
</template>