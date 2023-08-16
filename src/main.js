import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import HostGame from './components/HostGame.vue'
import JoinGame from './components/JoinGame.vue'
import Landing from './components/Landing.vue'
import PlayCard from './components/PlayCard.vue'
import MafiaVictory from './components/MafiaVictory.vue'
import CivilianVictory from './components/CivilianVictory.vue'
import Root from './components/Root.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/mafia-dapp-ui', component: Root },
        { path: '/mafia-dapp-ui/landing', component: Landing },
        { path: '/mafia-dapp-ui/game/host', component: HostGame },
        { path: '/mafia-dapp-ui/game/join', component: JoinGame },
        { path: '/mafia-dapp-ui/game/play', component: PlayCard },
        { path: '/mafia-dapp-ui/game/victory/mafia', component: MafiaVictory },
        { path: '/mafia-dapp-ui/game/victory/civilian', component: CivilianVictory },
    ]
});

const app = createApp(App);
app.use(router);
app.mount('#app')
