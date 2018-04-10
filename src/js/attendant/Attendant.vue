<script>
import firebase from '../firebase';
import ManageCurrentOrder from './ManageCurrentOrder';
import ManageAllOrders from './ManageAllOrders';

export default {
    components: {
        'manage-current-order': ManageCurrentOrder,
        'manage-all-orders': ManageAllOrders
    },
    data() {
        return {
            isSignedIn: false,
            isConnectedInitial: false,
            isConnected: false,
            isLoading: true,
            user: null,
        };
    },
    mounted() {
        this.authListener();
        this.firebaseLostConnectionHandler();
    },
    methods: {
        signIn() {
            let provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/userinfo.email');
            firebase.auth().signInWithPopup(provider).then((result) => {
              // This gives you a Google Access Token. You can use it to access the Google API.
              var token = result.credential.accessToken;
              var user = result.user;
              this.isSignedIn = true;
            }).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              var email = error.email;
              var credential = error.credential;
              alert('error: '+errorCode+' '+errorMessage);
            });
        },
        signOut() {
          if(!confirm('Sign out?'))
            return;
          firebase.auth().signOut().then(() => {
            this.isSignedIn = false;
          }).catch(function(error) {
            alert(error);
          });
        },
        authListener() {
          firebase.auth().onAuthStateChanged((user) => {
            if (user) {
              this.isSignedIn = true;
              this.user = user;
            } 
            else {
              this.isSignedIn = false;
              this.user = null;
            }
          });
        },
        firebaseLostConnectionHandler() {

          let initialConnTimer = setTimeout(() => {
            this.isLoading = false;
            this.isConnectedInitial = true;
            this.isConnected = false;
          }, 4000);

          firebase.database().ref('.info/connected').on('value', (connectedSnap) => {
            if(connectedSnap.val() === true) {
              clearTimeout(initialConnTimer);
              this.isLoading = false;
              this.isConnectedInitial = true;
              this.isConnected = true;
            } 
            else if(this.isConnectedInitial) {
              this.isConnected = false;
            }
          });
        }
    }
}
</script>
<template>
<div id="attendant">   

    <div class="loading-screen" v-if="isLoading">
      <img src="assets/img/white-loading.gif" />
      <h4>Loading...</h4>
    </div>
    <div class="disconnected" v-if="isConnectedInitial && !isConnected">
      <p><i class="fas fa-exclamation-circle"></i> <b>Internet Connection Lost</b></p>
      <p>Trying to reconnect...</p>
    </div>

    <div id="pos-checkout-toolbar" class="center">
        <div class="buttons left">
        </div>
        EMU Print Center: Attendant
        <div class="buttons right">
            {{ user ? user.email : '' }}
            <button v-on:click="signOut" v-if="isSignedIn"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
            <button v-on:click="signIn" v-else><i class="fas fa-sign-in-alt"></i> Sign In</button>
        </div>
    </div>

    <div class="container">

        <div v-if="isSignedIn">
            
            <manage-current-order v-on:loaded=""></manage-current-order>

            <manage-all-orders></manage-all-orders>

            <footer class="site-footer">
              Find an issue? Report it on the <a href="https://github.com/nathan815/EMUPrintCenter/issues" target="_blank">issue tracker</a>.
            </footer>

        </div>
        <div v-else-if="isConnectedInitial" class="sign-in-text">
            <p class="text-large">Sign in to access the print center attendant interface.</p>
            <button class="btn btn-lg" v-on:click="signIn">Sign in with Google</button>
        </div>
    </div>
</div>
</template>
