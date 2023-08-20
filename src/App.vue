<script>
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/css/index.css';

import { addErrorHandler } from './js/errors.js'
import './css/styles.css'
import { clearError } from './js/errors.js'
import { addLoadingHandler } from './js/loading.js'

export default {
  mounted() {
    addErrorHandler((msg, err) => {
      this.errorMessage = msg;
      if (err) {
        console.error(err);
      }
      
      // Automatically turn off the loading indicator if something broke
      this.isLoading = false;

      return true;
    })

    addLoadingHandler(isLoading => {
      this.isLoading = isLoading;
    })

    this.$router.afterEach(() => {
      // Make sure errors don't hang around between pages
      clearError();
    })
  },
  components: {
    Loading
  },
  data(){
    return {
      isLoading: false,
      errorMessage: null,
    }
  },
}
</script>

<template>
  <loading v-model:active="this.isLoading" :is-full-page="true"/>

  <div id="main-content">
    <div v-if="this.errorMessage" class="error">
      {{ this.errorMessage }}
    </div>
    <div id="router-view">
      <router-view></router-view>
    </div>
  </div>
</template>