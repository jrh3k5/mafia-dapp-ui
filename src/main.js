import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import {LoadingPlugin} from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

import App from './App.vue'
import HostGame from './components/HostGame.vue'
import JoinGame from './components/JoinGame.vue'
import Landing from './components/Landing.vue'
import PlayCard from './components/PlayCard.vue'
import MafiaVictory from './components/MafiaVictory.vue'
import CivilianVictory from './components/CivilianVictory.vue'
import Root from './components/Root.vue'

const router = createRouter({
    history: createWebHistory('/mafia-dapp-ui'),
    routes: [
        { name: 'Root', path: '/', component: Root },
        { name: 'Landing', path: '/landing', component: Landing },
        { name: 'HostGame', path: '/game/host', component: HostGame },
        { name: 'JoinGame', path: '/game/join', component: JoinGame },
        { name: 'PlayCard', path: '/game/play', component: PlayCard },
        { name: 'MafiaVictory', path: '/game/victory/mafia', component: MafiaVictory },
        { name: 'CivilianVictory', path: '/game/victory/civilian', component: CivilianVictory },
    ]
});

const app = createApp(App);
app.use(router);
app.use(LoadingPlugin);
app.mount('#app')
