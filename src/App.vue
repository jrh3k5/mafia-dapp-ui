<script>
import { addErrorHandler } from './js/errors.js'
import './css/styles.css'
import { TransactionSignatureRejected, clearError } from './js/errors.js'
import { addLoadingHandler, setLoading } from './js/loading.js'

export default {
  mounted() {
    addErrorHandler((msg, err) => {
      // don't show an error if the user rejected the transaction
      // presumably, they know they did this already
      if (err != TransactionSignatureRejected) {        
        this.errorMessage = msg;
        if (err) {
          console.error(err);
        }
      }
        
      setLoading(false);

      return true;
    })

    addLoadingHandler(isLoading => {
      if (isLoading) {
        if (this.loader) {
          // don't show the loader again - it's already displayed
          return;
        }

        this.loader = this.$loading.show({});
      } else if(this.loader) {
        this.loader.hide();
        this.loader = null;
      }
    })

    this.$router.afterEach(() => {
      // Make sure errors don't hang around between pages
      clearError();
    })
  },
  data(){
    return {
      loader: null,
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