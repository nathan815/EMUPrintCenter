<script>
import ManageCurrentOrder from './ManageCurrentOrder';
import ManageAllOrders from './ManageAllOrders';
export default {
    data() {
        return {
            isSignedIn: true,
        }
    },
    components: {
        'manage-current-order': ManageCurrentOrder,
        'manage-all-orders': ManageAllOrders
    },
    methods: {
        signIn() {
            alert('sign in')
        },
        signOut() {
            alert('sign out')
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
