<script>
import firebase from '../firebase';
import appConfig from '../app-config';
import OrderModel from '../models/Order';

import SplitPaymentPanel from './SplitPaymentPanel';
import PaymentMethodSelector from './PaymentMethodSelector';
import ItemTable from '../components/ItemTable';
import ItemAdder from '../components/ItemAdder';

const db = firebase.database();

export default {
    components: {
        ItemTable, ItemAdder, 
        PaymentMethodSelector, SplitPaymentPanel
    },
    data() {
        return {
            currentOrder: {}
        };
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
    // watch: {
    //     currentOrder(order) {
    //         if(order.id) {
    //             ref('allOrders').key(order.id)
    //         }
    //     }
    // },
    computed: {
        total() {
            return this.calculateTotal(this.currentOrder.items);
        },
        contactString() {
            let contact = [];
            if(this.currentOrder.contact.name)
                contact.push(this.currentOrder.contact.name);
            if(this.currentOrder.contact.email)
                contact.push(`<a href="mailto:${this.currentOrder.contact.email}">${this.currentOrder.contact.email}</a>`);
            return contact.join(' &bull; ');
        }
    },
    methods: {
        updateCurrentOrder(order) {
            delete order['.key'];
            this.$firebaseRefs.currentOrder.set(order);
        },
        updateItem(key, item) {
            delete item['.key'];
            this.$firebaseRefs.currentOrder.child('items').child(key).set(item);
        },
        newItem(item) {
            this.$firebaseRefs.currentOrder.child('items').push(item);
            this.$emit('created');
        },
        deleteItem(key) {
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
            let w = window.open(appConfig.PRINT_URL);
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
            if(this.currentOrder.id) {
                //db.ref('allOrders').child(this.currentOrder.id).child('hide').remove();
            }
            this.$firebaseRefs.currentOrder.set({
                ...OrderModel,
                resetState: true
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
    <section class="section current-order">
        <header>
            <h2 class="pull-left">Current Order</h2>
            <div class="pull-right" v-if="currentOrder.items">
                <button v-if="currentOrder.isPaid" class="btn btn-light" v-on:click="printReceipt()">
                    <i class="fas fa-print"></i> Print Customer Receipt
                </button>
                <button v-else-if="!currentOrder.isReadyToPay" class="btn btn-light" v-on:click="readyToPay()">
                    <i class="fas fa-check"></i> Ready to Pay
                </button>
                <button v-else class="btn btn-light" v-on:click="editOrder()">
                    <i class="fas fa-edit"></i> Edit Order
                </button>
                
                <button v-if="!currentOrder.isPaid && !currentOrder.id" class="btn btn-red" v-on:click="cancelOrder()">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
                <button v-if="currentOrder.id" class="btn btn-light" v-on:click="clearScreen()">
                    <i class="fas fa-times-circle"></i> Clear Screen
                </button>
            </div>
        </header>

        <div v-if="currentOrder.id">Saved Order - <b>{{ currentOrder.id }}</b></div>

        <div v-if="currentOrder.contact">
            Contact: <span v-html="contactString"></span>
        </div>
        <div v-if="currentOrder.notes">
            Notes: {{ currentOrder.contact.notes }}
        </div>

        <ItemTable :items="currentOrder.items" :show-total-row="true" :show-no-items-message="true"
                    :delete-item="deleteItem" :show-placeholder="false"
                    :editable="!currentOrder.isReadyToPay && !currentOrder.isPaid"
                    :update-item="updateItem" id="current-order-items">
        </ItemTable>

        <ItemAdder v-if="!currentOrder.isReadyToPay" :new-item="newItem" preset-text="Or, select a preset..."></ItemAdder>
        
        <PaymentMethodSelector v-on:selected="selectPaymentMethod" 
                               v-if="currentOrder.isReadyToPay && !currentOrder.isPaid">
        </PaymentMethodSelector>

        <div v-if="currentOrder.isInterdepartmental && !currentOrder.isPaid" class="payment-box">
            <p class="mt-0">
                <i>Payment via interdepartmental transfer form.</i>
                Please confirm that the transfer form can cover this amount. Clicking Confirm will <b>finalize</b> this order.
            </p>
            <button class="btn btn-orange" v-on:click="interdepartmentalFinalize()">Confirm</button>
        </div>

        <!-- Handles displaying split payment amounts, and the form to set those amounts -->
        <SplitPaymentPanel :total="total"
                             :current-order="currentOrder" 
                             :update-current-order="updateCurrentOrder">      
        </SplitPaymentPanel>

        <p v-if="currentOrder.isPaid">
            <i class="fas fa-check-circle"></i> 
            <span v-if="currentOrder.isCard">Card payment complete.</span>
            <span v-else>Paid with Interdepartmental Transfer Form.</span>
        </p>

        <p class="payment-instruction" v-if="currentOrder.isCard && !currentOrder.isPaid">Waiting for card payment from customer...</p>

    </section>
</template>
