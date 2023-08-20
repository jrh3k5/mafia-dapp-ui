<script>
import { addErrorHandler } from './js/errors.js'
import './css/styles.css'
import { clearError } from './js/errors.js'

export default {
  mounted() {
    addErrorHandler((msg, err) => {
      this.errorMessage = msg;
      if (err) {
        console.error(err);
      }
      return true;
    })

console.log("this.$router", this.$router);

    this.$router.afterEach(() => {
      clearError();
    })
  },
  data(){
    return {
      errorMessage: null,
    }
  },
}
</script>

<template>
  <div id="main-content">
    <div v-if="this.errorMessage" class="error">
      {{ this.errorMessage }}
    </div>
    <div id="router-view">
      <router-view></router-view>
    </div>
  </div>
</template>