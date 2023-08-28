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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<title>Mafia Dapp</title>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="./src/css/city.css" />
</head>
<body>
<div id="wrap">
  <div id="header"><br />
    <p><strong>Mafia Dapp</strong></p>
  </div>
  <div id="content">
    <div v-if="this.errorMessage" class="error">
      {{ this.errorMessage }}
    </div>
    <div id="router-view">
      <router-view></router-view>
    </div>
  </div>
  <div id="footer">
    <p class="text_footer">Adapted from design by kty <a href="http://www.studio-plume.org">studio-plume.org</a>.</p>
  </div>
</div>
</body>
</html>
</template>