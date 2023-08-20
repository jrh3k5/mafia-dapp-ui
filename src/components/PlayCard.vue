<script>
import { getMafiaService } from '../js/mafia_service.js'
import { getGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'
import * as PlayerRole from '../js/player_role.js'
import { GamePlayer } from '../js/player.js'
import { resetGameState } from '../js/game_state.js'
import * as PhaseOutcome from '../js/phase_outcome.js'
import * as TimeOfDay from '../js/time_of_day'
import { setLoading } from '../js/loading.js'

export default {
    data() {
        return {
            isHosting: false,
            isMafia: false,
            isCivilian: false,
            isDay: true, // game's start at day time
            isNight: false,
            killVote: null,
            mafiaAccusation: null,
            players: null,
            playerAddress: null,
            summarizingPhaseExecution: false,
            timeOfDayEnum: {},
            waitingForConviction: false,
            waitingForMurder: false,
        }
    },

    methods: {
        accuse: function() {
            setLoading(true);

            getGameState().then(gameState => {
                getMafiaService().then(mafiaService => {
                    mafiaService.accuseAsMafia(gameState.getHostAddress(), this.mafiaAccusation).then(() => {
                        this.waitingForConviction = true;

                        mafiaService.waitForPhaseExecution(gameState.getHostAddress()).then(this.handlePhaseExecution).then(() => {
                            this.mafiaAccusation = null;
                            this.waitingForConviction = false;
                        }).catch(err => reportError("Failed to wait for phase execution", err))
                          .finally(() => setLoading(false));
                    }).catch(err => reportError("Failed to submit accusation of player being Mafia", err));
                }).catch(reportGetContractError);
            }).catch(err => reportError("Failed to get game state while accusing another player", err))
        },
        beginNextPhase: function() {
            switch (this.phaseExecutionResults.phaseOutcome) {
                case PhaseOutcome.PhaseOutcomeCivilianVictory:
                    this.$router.push({ name: 'CivilianVictory' });
                    return;
                case PhaseOutcome.PhaseOutcomeMafiaVictory:
                    this.$router.push({ name: 'MafiaVictory' });
                    return;
                default:
                    this.summarizingPhaseExecution = false;
            }
        },
        canPlay: function() {
            const thisPlayer = this.resolvePlayer(this.playerAddress);
            if (!thisPlayer) {
                return false;
            }
            return !thisPlayer.dead && !thisPlayer.convicted;
        },
        executePhase: function() {
            setLoading(true);

            getGameState().then(gameState => {
                getMafiaService().then(mafiaService => {
                    mafiaService.waitForPhaseExecution(gameState.getHostAddress()).then(this.handlePhaseExecution).catch(err => reportError("Failed to wait for phase execution", err));
                    mafiaService.executePhase().catch(err => reportError("Failed to execute game phase", err));
                }).catch(reportGetContractError)
                  .finally(() => setLoading(false));
            }).catch(err => reportError("Failed to get game state on phase execution", err))
        },
        getOtherPlayers: function() {
            // if the page hasn't fully mounted yet, return nothing
            if (!this.playerAddress || !this.players) {
                return [];
            }

            return this.players.filter(p => this.playerAddress.toLowerCase() != p.playerAddress.toLowerCase());
        },
        getVotablePlayers: function() {
            return this.getOtherPlayers().filter(p => !p.dead && !p.convicted);
        },
        handlePhaseExecution: function(resolutionArgs) {
            const [phaseOutcome, timeOfDay, playersKilled, playersConvicted] = resolutionArgs;
            this.phaseExecutionResults = {
                phaseOutcome: phaseOutcome,
                timeOfDay: timeOfDay,
            }

            if (timeOfDay == TimeOfDay.TimeOfDayDay) {
                if(playersConvicted) {
                    playersConvicted.forEach(playerAddress => {
                        let resolvedName;
                        const resolvedPlayer = this.resolvePlayer(playerAddress);
                        if(resolvedPlayer) {
                            resolvedName = resolvedPlayer.playerNickname;
                            resolvedPlayer.convicted = true;
                        }
                        
                        if (!resolvedName) {
                            resolvedName = playerAddress;
                        }

                        this.phaseExecutionResults.convictedPlayer = resolvedName;
                    })
                }

                this.isDay = false;
                this.isNight = true;

                // If the player is a civilian, then queue them up to wait for the night phase to finish
                if (this.isCivilian && !this.isHosting) {
                    setLoading(true);

                    getGameState().then(gameState => {
                        getMafiaService().then(mafiaService => {
                            mafiaService.waitForPhaseExecution(gameState.getHostAddress()).then(this.handlePhaseExecution).catch(err => reportError("Failed to wait for phase execution", err));
                        }).catch(err => reportError("Failed to get Mafia service while preparing to wait for phase execution", err))
                          .finally(() => setLoading(false));
                    }).catch(err => reportError("Failed to get game state while preparing to wait for phase execution", err));
                }
            } else if (timeOfDay == TimeOfDay.TimeOfDayNight) {
                if(playersKilled) {
                    playersKilled.forEach(playerAddress => {
                        let resolvedName;
                        const resolvedPlayer = this.resolvePlayer(playerAddress);
                        if (resolvedPlayer) {
                            resolvedName = resolvedPlayer.playerNickname;
                            resolvedPlayer.dead = true;
                        }

                        if (!resolvedName) {
                            resolvedName = playerAddress;
                        }
                        
                        this.phaseExecutionResults.killedPlayer = resolvedName;
                    })
                }

                this.isNight = false;
                this.isDay = true;
            }

            this.summarizingPhaseExecution = true;
        },
        resolvePlayer: function(walletAddress) {
            if(!this.players) {
                return null;
            }

            const match = this.players.filter(p => p.playerAddress.toLowerCase() == walletAddress.toLowerCase())[0]
            if(!match) {
                return null;
            }

            return match
        },
        voteToKill: function() {
            setLoading(true);

            getGameState().then(gameState => {
                getMafiaService().then(mafiaService => {
                    mafiaService.voteToKill(gameState.getHostAddress(), this.killVote).then(() => {
                        this.waitingForMurder = true;

                        mafiaService.waitForPhaseExecution(gameState.getHostAddress()).then(this.handlePhaseExecution).then(() => {
                            this.killVote = null;
                            this.waitingForMurder = false;
                        }).catch(err => reportError("Failed to wait for phase execution", err))
                          .finally(() => setLoading(false));
                    }).catch(err => reportError("Failed to submit accusation of player being Mafia", err));
                }).catch(reportGetContractError);
            }).catch(err => reportError("Failed to get game state while voting to kill", err))
        }
    },

    mounted() {
        this.timeOfDayEnum = TimeOfDay;

        setLoading(true);

        getGameState().then(gameState => {
            const hostAddress = gameState.getHostAddress();
            if (!hostAddress) {
                reportError("No host address could be retrieved from the game state; you will be taken to the main page now to restart your game", null);
                resetGameState();
                this.$router.push({ name: 'Landing' });
                return;
            }

            this.playerAddress = gameState.getPlayerAddress();
            this.isHosting = gameState.isHosting();

            getMafiaService().then(mafiaService => {
                Promise.all([mafiaService.getPlayerRole(hostAddres), mafiaService.getPlayerNicknames(hostAddress)]).then(results => {
                    const [playerRole, playerNicknames] = results;

                    this.isMafia = playerRole === PlayerRole.PlayerRoleMafia;
                    this.isCivilian = playerRole === PlayerRole.PlayerRoleCivilian;

                    this.players = [];
                    playerNicknames.forEach((playerNickname, playerAddress) => {
                        this.players.push(new GamePlayer(playerAddress, playerNickname));
                    })
                    this.players.sort((a, b) => a.playerNickname.localeCompare(b.playerNickname));
                }).catch(err => reportError("Failed to get player information on load", err))
                  .finally(() => setLoading(false));
            }).catch(reportGetContractError);
        }).catch(err => reportError("Failed to get game state on initialization", err))
    }
}
</script>

<template>
    <div class="player-role">
        <div v-if="this.isMafia">
            <img class="player-role-profile-pic" src="../img/mafia.png" /> You are MAFIA.
        </div>
        <div v-if="this.isCivilian">
            <img class="player-role-profile-pic" src="../img/civilian.png" /> You are a CIVILIAN.
        </div>
    </div>

    <hr />

    <div v-if="this.players && !this.summarizingPhaseExecution && this.canPlay()">
        Use the following table to track the conditions of your fellow players. It will be automatically populate as players are killed or convicted.

        <table>
            <thead>
                <tr>
                    <th>Player Nickname</th>
                    <th>Dead</th>
                    <th>Convicted</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in this.getOtherPlayers()">
                    <td>{{ player.playerNickname }}</td>
                    <td><input type="checkbox" class="death-tracker" v-model="player.dead" readonly /></td>
                    <td><input type="checkbox" class="conviction-tracker" v-model="player.convicted" readonly /></td>
                </tr> 
            </tbody>
        </table>

        <hr />

        <div v-if="this.isDay">
            <div v-if="!this.waitingForConviction">
                It's day time! It's time to vote out one player as Mafia.
                <span v-if="this.isMafia">Try to lead the civilians astray in convicting one of their own as being Mafia.</span>
                <span v-if="this.isCivilian">One or more of you is a member of the Mafia. Work with your fellow players to try and identify who that might be.</span>

                <p />

                <select v-model="this.mafiaAccusation">
                    <option disabled value="">Select a player to vote for as Mafia</option>
                    <option v-for="player in this.getVotablePlayers()" :key="player.playerAddress" :value="player.playerAddress">
                        {{  player.playerNickname }}
                    </option>
                </select>

                <p />

                <button type="submit" @click="this.accuse()" :disabled="!this.mafiaAccusation">Accuse Player</button>
            </div>
            <div v-if="this.waitingForConviction">
                You have submitted an accusation of a player being Mafia.

                <div v-if="this.isHosting">
                    <p />

                    Once all players have indicated that they have voted, click the button below to proceed with the game.

                    <p />

                    <button type="submit" @click="this.executePhase()">Tally Accusations</button>
                </div>
                <div v-if="!this.isHosting">
                    Let the host know that you have submitted your vote. When the host tallies the votes, you will be automatically taken to the next phase of the game.
                </div>
            </div>
        </div>
        <div v-if="this.isNight">
            It's night time!

            <div v-if="this.isCivilian">
                Keep your eyes closed! It's now the Mafia's chance to try and eliminate someone they think is a threat to them - better hope it wasn't you!
                <p v-if="this.isHosting">
                    Start a timer for one minute to give the Mafia enough time to coordinate and identify who to kill. When the timer is up, click the button below to proceed.

                    <button type="submit" @click="this.executePhase()">Continue</button>
                </p>
            </div>
            <div v-if="this.isMafia">
                <div v-if="!this.waitingForMurder">
                    Now's your time to try and eliminate a civilian you think is a threat to you and your fellow Mafia members. Work with your fellow Mafiosos to identify someone you want dead.
                    <p />

                    <select v-model="this.killVote">
                        <option disabled value="">Select a player to kill</option>
                        <option v-for="player in this.getVotablePlayers()" :key="player.playerAddress" :value="player.playerAddress">
                            {{  player.playerNickname }}
                        </option>
                    </select>

                    <p />

                    <button type="submit" @click="this.voteToKill()" :disabled="!this.killVote">Vote to Kill</button>
                </div>
                <div v-if="this.waitingForMurder">
                    <div v-if="!this.isHosting">
                        Your vote to kill a player has been submitted. Wait for the round timer to complete and the host to tally the kill votes.
                    </div>
                    <div v-if="this.isHosting">
                        Your vote to kill a player has been submitted. When the timer concludes, click the button below to submit the kill votes.

                        <button type="submit" @click="this.executePhase()">Continue</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="this.players && !this.summarizingPhaseExecution && !this.canPlay()">
        You are, unfortunately, unable to continue playing the game. From here on out, give your fellow teammates the moral support they need for victory!

        <div v-if="this.isHosting">
            As host, however, you must ensure that each phase is executed. Once the round phase is ready to resolve, click the button below.

            <button type="submit" @click="this.executePhase()">Continue</button>
        </div>
    </div>

    <div v-if="this.summarizingPhaseExecution && this.phaseExecutionResults">
        <div v-if="this.phaseExecutionResults.timeOfDay == this.timeOfDayEnum.TimeOfDayDay">
            <div v-if="this.phaseExecutionResults.convictedPlayer">
                By majority vote, the people of the city have convicted {{ this.phaseExecutionResults.convictedPlayer }} of being a member of the Mafia.
            </div>
            <div v-if="!this.phaseExecutionResults.convictedPlayer">
                The city could not come to a majority agreement on who is a member of the Mafia; the day passes without a conviction.
            </div>
        </div>
        <div v-if="this.phaseExecutionResults.timeOfDay == this.timeOfDayEnum.TimeOfDayNight">
            <div v-if="this.phaseExecutionResults.killedPlayer">
                As the citizens of the city slept, the Mafia quietly conspired to end the life of {{  this.phaseExecutionResults.killedPlayer }}. The day dawns with one less person in the city.
            </div>
            <div v-if="!this.phaseExecutionResults.killedPlayer">
                In a rare showing of mercy, the Mafia has not come to a majority vote of who should die. The day dawns with as many people as when it left.
            </div>
        </div>

        <button type="submit" @click="this.beginNextPhase()">Continue</button>
    </div>
</template>