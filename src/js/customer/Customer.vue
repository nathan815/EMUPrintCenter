<script>
import appConfig from '../app-config';
import firebase from '../firebase';
import ItemTable from '../components/ItemTable';

const db = firebase.database();

export default {
    components: {
        ItemTable
    },
    data() {
        return {
            currentState: 'BEGIN',
            isLoading: true,
            isConnected: false,
            currentOrder: {}
        };
    },
    mounted() {
        this.getState();
        this.listenForMessages();
        this.firebaseLostConnectionHandler();
    },
    computed: {
        isOrderComplete() {
            return this.currentState === 'COMPLETE';
        },
        isSplitPayment() {
            return this.currentOrder.isSplitPayment
                && this.currentOrder.splitPayment.interdepartmentalAmount > 0
                && this.currentOrder.splitPayment.cardAmount > 0;
        },
        total() {
            return this.calculateTotal(this.currentOrder.items);
        }
    },
    firebase: {
        currentOrder: {
            asObject: true,
            source: db.ref('currentOrder')
        }
    },
    watch: {
        currentOrder: {
            deep: true,
            handler(order) {
                this.currentOrderUpdated(order);
            }
        }
    },
    methods: {
        openPayWindow() {
            this.sendMessage({ action: 'clearPaySiteSessionCookie' });
            this.setState('BEGIN', function() {
                let payWindow = window.open(appConfig.PAY_URL);
            });
        },
        printReceipt() {
            let w = window.open(appConfig.PRINT_URL);
            w.printData = {
                currentOrder: this.currentOrder,
                receiptHtml: document.getElementById('receipt').innerHTML
            };
        },
        saveOrder() {
            const order = {...this.currentOrder};
            delete order['.key'];
            order.datePaid = new Date().toISOString();
            order.isPaid = true;
            // save order to allOrders
            let pushRef = db.ref('allOrders').push(order);
            order.isSaved = true;
            // update currentOrder
            this.$firebaseRefs.currentOrder.set(order);
        },
        currentOrderUpdated(order) {
            if(this.isObjectEmpty(order))
                return;
            if(order.isPaid) {
                this.setState('COMPLETE');
                if(!order.isSaved)
                    this.saveOrder();
            }
            if(this.isObjectEmpty(order.items))
                this.setState('DEFAULT');
            if(order.resetState) {
                this.setState('DEFAULT');
                // clear out temporary properties from currentOrder
                this.$firebaseRefs.currentOrder.child('resetState').remove();
                this.$firebaseRefs.currentOrder.child('isSaved').remove();
                this.sendMessage({ action: 'closePaymentWindow' });
            }
            this.sendMessage({ 
                action: 'currentOrderChanged', 
                data: { 
                    order: order,
                    total: this.total
                }
            });
        },
        handleStateChange(state) {
            console.log('state changed: ',state);
            this.currentState = state;
            switch(state) {
                case 'BEGIN':
                break;
                case 'COMPLETE':
                    if(!this.currentOrder.isPaid)
                        this.$firebaseRefs.currentOrder.child('isPaid').set(true);
                break;
                case 'CANCEL':
                    this.setState('BEGIN');
                break;
            };
        },
        handleMessage(msg) {
            switch(msg.action) {
                case 'stateChanged':
                    this.handleStateChange(msg.state);
                break;
            }
        },
        listenForMessages() {
            chrome.runtime.onMessage.addListener((msg, sender, response) => {
                console.log('message recieved: ', msg);
                this.handleMessage(msg);
            });
        },
        getState(cb) {
            chrome.runtime.sendMessage({ action: 'currentState' }, (response) => {
                this.currentState = response.state;
                this.handleStateChange(response.state);
                console.log('State = ' + response.state);
                if(cb) cb(response.state);
            });
        },
        setState(state, cb) {
            chrome.runtime.sendMessage({ setState: state }, (response) => {
                this.currentState = state;
                console.log('Set State = ' + state);
                if(cb) cb();
            });
        },
        sendMessage(data, cb) {
            console.log('sent message',data)
            chrome.runtime.sendMessage(data, (response) => {
                if(cb) cb();
            });
        },
        firebaseLostConnectionHandler() {
          db.ref('.info/connected').on('value', (connectedSnap) => {
            this.isConnected = connectedSnap.val();
            if(connectedSnap.val() === true)
              this.isLoading = false;
          });
        }
    }
}
</script>

<template>
    <div id="customer">
        <div id="pos-checkout-toolbar" class="center">
            EMU Print Center
        </div>

        <div class="loading-screen" v-if="isLoading || !isConnected">
          <img src="assets/img/white-loading.gif" />
          <h4 v-if="isLoading">Loading...</h4>
          <h4 v-else-if="!isConnected">Connection lost, reconnecting...</h4>
        </div>
        
        <div class="container">

            <div class="leading-text">
                <p v-if="isOrderComplete">
                    <i class="fas fa-check-circle"></i>
                    Your order is complete.<br>
                    Thank you!
                </p>
                <p v-else>Welcome to the Print Center!</p>
            </div>
            <div id="receipt">
                <ItemTable :items="currentOrder.items" :show-placeholder="true"
                            :editable="false">
                </ItemTable>
                <footer>
                    <span v-if="currentOrder.items">Total: <b>${{ total.toFixed(2) }}</b></span>
                    <span v-else class="waiting-order">Waiting for order...</span>
                    <div v-if="isSplitPayment" class="split-payment">
                        Interdepartmental Form: <span class="text-red">-${{ currentOrder.splitPayment.interdepartmentalAmount }}</span>
                        <br>
                        Balance Due: <b>${{ currentOrder.splitPayment.cardAmount }} </b>
                    </div>
                </footer>
            </div>
            <div v-if="isOrderComplete">
                <p>Click below if you want a copy of your receipt.</p>
                <button v-on:click="printReceipt" class="btn btn-lg"><i class="fas fa-print"></i> Print Receipt</button>
            </div>
            <button v-else v-on:click="openPayWindow" :disabled="currentOrder && !currentOrder.isCard" class="btn btn-lg">
                Pay with Card <i class="fas fa-arrow-right"></i>
            </button>

            <div class="payment-info">
                <p><b>Important:</b> We can only accept cards and interdepartmental transfer forms.</p>
                <p class="cards"><img src="assets/img/cards.png" /></p>
            </div>
        </div>
    </div>
</template>
