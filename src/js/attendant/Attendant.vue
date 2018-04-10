<script>
import firebase from '../firebase';
const db = firebase.database();

export default {
    data() {
        return {
            isSignedIn: true,
            currentOrder: {}
        }
    },
    firebase: {
        currentOrder: {
            asObject: true,
            source: db.ref('currentOrder'),
            cancelCallback: function(err) {
                console.log('Firebase error: ',err);
            },
        }
    },
    computed: {
        total() {
            return this.calculateTotal(this.currentOrder.items);
        }
    },
    methods: {
        signIn() {
            alert('sign in')
        },
        signOut() {
            alert('sign out')
        },
        updateCurrentOrder(order) {
            delete order['.key'];
            this.$firebaseRefs.currentOrder.set(order);
        },
        updateItemCurrentOrder(key) {
            const item = this.currentOrder.items[key];
            const itemCopy = {...item};
            delete itemCopy['.key'];
            this.$firebaseRefs.currentOrder.child('items').child(key).set(itemCopy);
        },
        newItemCurrentOrder(item) {
            this.$firebaseRefs.currentOrder.child('items').push(item);
        },
        deleteItemCurrentOrder(key) {
            this.$firebaseRefs.currentOrder.child('items').child(key).remove();
        },
        selectPaymentMethod(method) {
            let curOrderRef = this.$firebaseRefs.currentOrder;
            curOrderRef.child('isSplitPayment').set(false);
            curOrderRef.child('splitPayment').set({ cardAmount: 0, interdepartmentalAmount: 0 });
            curOrderRef.child('isCard').set(false);
            curOrderRef.child('isInterdepartmental').set(false);
            switch(method) {
                case 'card':
                    curOrderRef.child('isCard').set(true);
                break;
                case 'inter':
                    curOrderRef.child('isInterdepartmental').set(true);
                break;
                case 'card+inter':
                    curOrderRef.child('isSplitPayment').set(true);
                break;
            }
        },
        interdepartmentalFinalize() {
            this.$firebaseRefs.currentOrder.child('isCard').set(false);
            this.$firebaseRefs.currentOrder.child('isInterdepartmental').set(true);
            this.$firebaseRefs.currentOrder.child('isPaid').set(true);
        },
        printReceipt() {
            let w = window.open('/receipt-print.html');
            w.printData = {
                currentOrder: this.currentOrder,
                receiptHtml: document.getElementById('current-order-items').outerHTML
            };
        },
        readyToPay() {
            this.$firebaseRefs.currentOrder.child('isReadyToPay').set(true);
        },
        editOrder() {
            this.selectPaymentMethod('none');
            this.$firebaseRefs.currentOrder.child('isReadyToPay').set(false);
        },
        clearScreen() {
            // reset currentOrder
            this.$firebaseRefs.currentOrder.set({
                resetState: true,
                items: [],
                isReadyToPay: false,
                isCard: false,
                isInterdepartmental: false,
                isSplitPayment: false,
                splitPayment: {
                    cardAmount: 0,
                    interdepartmentalAmount: 0
                },
                isPaid: false,
                datePaid: ''
            });
        },
        cancelOrder() {
            let msg = '';
            if(this.currentOrder.isCard) 
                msg += 'WARNING: Cancelling the order will close the card payment window.\n';
            msg += 'Are you sure you want to cancel the order? Click "OK" to confirm.';
            if(confirm(msg))
                this.clearScreen();
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
            <section class="section current-order">
                <header>
                    <h2 class="pull-left">Current Order</h2>
                    <div class="pull-right" v-if="currentOrder.items">
                        <div v-if="currentOrder.isPaid">
                            <button class="btn btn-light" v-on:click="printReceipt()">
                                <i class="fas fa-print"></i> Print Customer Receipt
                            </button>
                            <button class="btn btn-light" v-on:click="clearScreen()">
                                <i class="fas fa-check-circle"></i> Clear Screen
                            </button>
                        </div>
                        <button v-else-if="!currentOrder.isReadyToPay" class="btn btn-light" v-on:click="readyToPay()">
                            <i class="fas fa-check"></i> Ready to Pay
                        </button>
                        <button v-else class="btn btn-light" v-on:click="editOrder()">
                            <i class="fas fa-edit"></i> Edit Order
                        </button>
                        
                        <button v-if="!currentOrder.isPaid" class="btn btn-red" v-on:click="cancelOrder()">
                            <i class="fas fa-times"></i> Cancel Order
                        </button>
                    </div>
                </header>

                <item-table :items="currentOrder.items" :show-total-row="true" 
                            :delete-item="deleteItemCurrentOrder" :show-placeholder="false"
                            :editable="!currentOrder.isReadyToPay && !currentOrder.isPaid"
                            :update-item="updateItemCurrentOrder" id="current-order-items">
                </item-table>
                <item-adder v-if="!currentOrder.isReadyToPay" :new-item="newItemCurrentOrder"></item-adder>
                
                <div v-if="currentOrder.isReadyToPay && !currentOrder.isPaid">
                    Payment Method <i class="fas fa-arrow-right"></i> &nbsp;
                    <button class="btn btn-light" v-on:click="selectPaymentMethod('card')">
                        <i class="far fa-credit-card"></i> Card
                    </button>
                    <button class="btn btn-light" v-on:click="selectPaymentMethod('inter')">
                        <i class="fas fa-exchange-alt"></i> Interdepartmental
                    </button>
                    <button class="btn btn-light" v-on:click="selectPaymentMethod('card+inter')">
                        <i class="far fa-credit-card"></i> Card + <i class="fas fa-exchange-alt"></i> Interdepartmental
                    </button>
                </div>

                <div v-if="currentOrder.isInterdepartmental && !currentOrder.isPaid" class="payment-box">
                    <p class="mt-0"><i>Payment via interdepartmental transfer form.</i> Please confirm that the transfer form can cover this amount. Clicking Confirm will <b>finalize</b> this order. </p>
                    <button class="btn btn-orange" v-on:click="interdepartmentalFinalize()">Confirm</button>
                </div>

                <!-- Handles displaying split payment amounts, and the form to set those amounts -->
                <split-payment-panel :total="total"
                                     :current-order="currentOrder" 
                                     :update-current-order="updateCurrentOrder">      
                </split-payment-panel>

                <p v-if="currentOrder.isPaid">
                    <i class="fas fa-check-circle"></i> 
                    <span v-if="currentOrder.isCard">Card payment complete.</span>
                    <span v-else>Paid with Interdepartmental Transfer Form.</span>
                </p>

                <p class="payment-instruction" v-if="currentOrder.isCard && !currentOrder.isPaid">Waiting for card payment from customer...</p>

            </section><!-- end .current-order-->

            <section class="section orders">

                <header>
                    <h2 class="pull-left">
                        Orders
                        <select>
                            <option>All</option>
                            <option>Not Paid</option>
                            <option>Paid</option>
                        </select>
                    </h2>
                    <button class="btn pull-right"><i class="fas fa-plus"></i> Add Email Order</button>
                </header>
                
                <div class="order">
                    <header>
                        <h3 class="pull-left">Order #1</h3>
                        <span class="header-details pull-right">
                            <span class="paid not">Hasn't Paid</span> 
                            <br>
                            <a href="#"><i class="fas fa-dollar-sign"></i> Begin Payment</a>
                        </span>
                    </header>
                    <div class="details">
                        <p class="contact"><i>Contact:</i> John Doe &bull; john@doe.com</p>
                        <p class="notes"><i>Notes:</i> they want this, and that, and that</p>
                        <div class="items">
                            <h4>Items in this order</h4>
                           <item-table :show-total-row="true" :show-placeholder="false"></item-table>
                        </div>
                    </div><!-- end .details-->
                </div><!-- end .order-->

            </section><!-- end section.orders-->

        </div>
        <div v-else class="sign-in-text">
            <p class="text-large">Sign in to access the print center attendant interface.</p>
            <button class="btn btn-lg" v-on:click="signIn">Sign in with Google</button>
        </div>
    </div>
</div>
</template>
