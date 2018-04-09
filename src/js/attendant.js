import Vue from 'vue';
import firebase from './firebase';

import VueSelect from 'vue-select';
import VueFire from 'vuefire';
import ItemTable from './components/ItemTable';
import ItemAdder from './components/ItemAdder';

// Initialize Components
Vue.use(VueFire);
Vue.component('v-select', VueSelect);
Vue.component('item-table', ItemTable);
Vue.component('item-adder', ItemAdder);

Vue.mixin({
  methods: {
    // capitalizeFirstLetter: str => str.charAt(0).toUpperCase() + str.slice(1),
    moneyFormat: function(num) {
        return num % 1 === 0 ? num : num.toFixed(2);
    },
    calculateTotal: function(items) {
        let total = 0;
        if(!items)
            return 0;
        for(let key in items) {
            total += items[key].cost * items[key].qty;
        }
        return Math.round(total * 100) / 100;
    }
  }
});

const DEFAULT_CURRENT_ORDER = { 
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
};

/**
  * Create Main App Vue Instance
  */

let app = new Vue({
    el: '#app',
    data: {
        isSignedIn: true,
        cardAmount: 0,
        interdepartmentalAmount: 0,
        currentOrder: {}
    },
    firebase: {
        currentOrder: {
            asObject: true,
            source: firebase.database().ref('currentOrder'),
            cancelCallback: function(err) {
                console.log('Firebase error: ',err);
            },
        }
    },
    computed: {
        total: function() {
            return this.calculateTotal(this.currentOrder.items);
        }
    },
    methods: {
        signIn: function() {
            alert('sign in')
        },
        signOut: function() {
            alert('sign out')
        },
        updateItemCurrentOrder: function(key) {
            let item = this.currentOrder.items[key];
            // create a copy of the item
            const itemCopy = {...item};
            // remove the .key attribute
            delete itemCopy['.key'];
            this.$firebaseRefs.currentOrder.child('items').child(key).set(itemCopy);
        },
        newItemCurrentOrder: function(item) {
            this.$firebaseRefs.currentOrder.child('items').push(item);
        },
        deleteItemCurrentOrder: function(key) {
            this.$firebaseRefs.currentOrder.child('items').child(key).remove();
        },
        selectPaymentMethod: function(method) {
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
        updateInterdepartmentalAmount: function(e) {
            let val = e.target.value;
            if(val > this.total) return;
            this.interdepartmentalAmount = val;
            this.cardAmount = this.total - val;
        },
        interdepartmentalFinalize: function() {
            this.$firebaseRefs.currentOrder.child('isCard').set(false);
            this.$firebaseRefs.currentOrder.child('isInterdepartmental').set(true);
            this.$firebaseRefs.currentOrder.child('isPaid').set(true);
        },
        splitPaymentAmountSubmit: function(e) {
            let card = parseFloat(e.target.elements.card.value);
            let inter = parseFloat(e.target.elements.inter.value);
            if(card + inter !== this.total) {
                alert('The sum of both amounts must equal $' + this.total + 
                      '. Card amount will be automatically calculated upon entering amount for interdepartmental form.');
                return;
            }
            this.$firebaseRefs.currentOrder.child('splitPayment').set({
                cardAmount: card.toFixed(2),
                interdepartmentalAmount: inter.toFixed(2)
            });
            this.$firebaseRefs.currentOrder.child('isCard').set(true);
        },
        printReceipt: function() {
            let w = window.open('/receipt-print.html');
            w.printData = {
                currentOrder: this.currentOrder,
                receiptHtml: document.getElementById('current-order-items').outerHTML
            };
        },
        readyToPay: function() {
            this.$firebaseRefs.currentOrder.child('isReadyToPay').set(true);
        },
        editOrder: function() {
            this.selectPaymentMethod('none');
            this.$firebaseRefs.currentOrder.child('isReadyToPay').set(false);
        },
        clearScreen: function() {
            // reset currentOrder
            this.$firebaseRefs.currentOrder.set({
                ...DEFAULT_CURRENT_ORDER,
                resetState: true
            });
        },
        cancelOrder: function() {
            let msg = '';
            if(this.currentOrder.isCard) 
                msg += 'WARNING: Cancelling the order will close the card payment window.\n';
            msg += 'Are you sure you want to cancel the order? Click "OK" to confirm.';
            if(confirm(msg))
                this.clearScreen();
        },
    }
});
