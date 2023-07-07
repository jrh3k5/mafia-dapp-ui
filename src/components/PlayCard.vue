<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { requireGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'
import * as PlayerRole from '../js/player_role.js'
import { GamePlayer } from '../js/player.js'

export default {
    data() {
        return {
            isMafia: false,
            isCivilian: false,
            players: null,
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
                this.players = [];
                playerNicknames.forEach((playerNickname, playerAddress) => {
                    this.players.push(new GamePlayer(playerAddress, playerNickname));
                })
                this.players.sort((a, b) => a.playerNickname.localeCompare(b.playerNickname));
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

    <p />

    <div v-if="this.players">
        Use the following table to track the conditions of your fellow players.

        <table>
            <thead>
                <tr>
                    <th>Player Nickname</th>
                    <th>Dead</th>
                    <th>Expelled as Mafia</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in this.players">
                    <td>{{ player.playerNickname }}</td>
                    <td><input type="checkbox" /></td>
                    <td><input type="checkbox" /></td>
                </tr> 
            </tbody>
        </table>
    </div>
</template>