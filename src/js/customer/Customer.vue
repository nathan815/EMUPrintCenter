<script>
import appConfig from '../appConfig';

export default {
    data() {
        return {
            currentState: 'BEGIN',
            currentOrder: {},
            total: 0
        };
    },
    mounted: function() {
        this.getState();
        this.getCurrentOrder();
        this.listenForMessages();
    },
    computed: {
        isOrderComplete: function() {
            return this.currentState === 'COMPLETE';
        },
        isSplitPayment: function() {
            return this.currentOrder.isSplitPayment
                && this.currentOrder.splitPayment.interdepartmentalAmount > 0
                && this.currentOrder.splitPayment.cardAmount > 0;
        },
        parsedItems: function() {
            let items = this.currentOrder.items;
            if(this.itemsEmpty) {
                items = {};
                items[0] = {name: '...', cost: 0, qty: 0 };
            }

            let parsedItems = {};
            for(let key in items) {
                let item = items[key];
                parsedItems[key] = {
                    name: item.name,
                    cost: item.cost ? '$' + this.moneyFormat(item.cost) : '...',
                    qty: item.qty ? item.qty : '...',
                    total: item.cost ? '$' + this.moneyFormat(item.cost*item.qty) : '...'
                };
            }
            return parsedItems;
        },
        itemsEmpty: function() {
            if(!this.currentOrder.items)
                return true;
            return Object.keys(this.currentOrder.items).length === 0;
        },
    },
    methods: {
        openPayWindow: function() {
            this.sendMessage({ action: 'clearPaySiteSessionCookie' });
            this.setState('BEGIN', function() {
                let payWindow = window.open(appConfig.PAY_URL);
            });
        },
        printReceipt: function() {
            let w = window.open(PRINT_URL);
            w.printData = {
                currentOrder: this.currentOrder,
                receiptHtml: document.getElementById('receipt').innerHTML
            };
        },
        handleStateChange: function(state) {
            console.log('state changed: ',state);
            this.currentState = state;
            switch(state) {
                case 'BEGIN':
                break;
                case 'COMPLETE':
                    //this.orderCompleted();
                break;
                case 'CANCEL':
                    this.setState('BEGIN');
                break;
            };
        },
        handleMessage: function(msg) {
            switch(msg.action) {
                case 'stateChanged':
                    this.handleStateChange(msg.state);
                break;
                case 'currentOrderChanged':
                    this.total = msg.total;
                    this.currentOrder = msg.order;
                break;
                case 'clearOrder':
                    this.clearOrder();
                break;
            }
        },
        listenForMessages: function() {
            chrome.runtime.onMessage.addListener((msg, sender, response) => {
                console.log('message recieved: ', msg);
                this.handleMessage(msg);
            });
        },
        getCurrentOrder: function() {
            chrome.runtime.sendMessage({ action: 'getCurrentOrder' }, (response) => {
                this.total = response.total;
                this.currentOrder = response.order;
            });
        },
        getState: function(cb) {
            chrome.runtime.sendMessage({ action: 'currentState' }, (response) => {
                this.currentState = response.state;
                this.handleStateChange(response.state);
                console.log('State = ' + response.state);
                if(cb) cb(response.state);
            });
        },
        setState: function(state, cb) {
            chrome.runtime.sendMessage({ setState: state }, (response) => {
                this.currentState = state;
                console.log('Set State = ' + state);
                if(cb) cb();
            });
        },
        sendMessage: function(data, cb) {
            chrome.runtime.sendMessage(data, (response) => {
                if(cb) cb();
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
                <table>
                    <tr>
                        <th class="product">Product</th>
                        <th class="right">Cost</th>
                        <th class="right">Qty</th>
                        <th class="right">Total</th>
                    </tr>
                    <tr v-for="(item,key) in parsedItems" :key="key">
                        <td class="product">{{ item.name }}</td>
                        <td class="right">{{ item.cost }}</td>
                        <td class="right">{{ item.qty }}</td>
                        <td class="right">{{ item.total }}</td>
                    </tr>
                </table>
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