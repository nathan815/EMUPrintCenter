<script>
import { firebaseApp, firebase } from '../firebase';
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
            user: null
        }
    },
    mounted() {
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
              console.log('error: ',errorCode,errorMessage,email,credential);
            });
        },
        signOut() {
            firebase.auth().signOut().then(() => {
                this.isSignedIn = false;
            }).catch(function(error) {
            });
        }
    }
}
</script>
<template>
<div id="attendant">    
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
            
            <manage-current-order></manage-current-order>

            <manage-all-orders></manage-all-orders>

        </div>
        <div v-else class="sign-in-text">
            <p class="text-large">Sign in to access the print center attendant interface.</p>
            <button class="btn btn-lg" v-on:click="signIn">Sign in with Google</button>
        </div>
    </div>
</div>
</template>
