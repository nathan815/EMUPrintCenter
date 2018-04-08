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

Vue.component('v-select', VueSelect.VueSelect);

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
})

Vue.component('item-adder', {
    template: '#item-adder',
    data: function() {
        return {
            isFormVisible: false,
            selectedType: null,
            itemTypes: [],
            presetSizes: [ {w:40,l:54}, {w:36,l:48}, {w:24,l:36}, {w:18,l:24} ],
            posterWidth: null,
            posterLength: null,
            qty: null
        }
    },
    mounted: function() {
        this.fetchItemTypes();
    },
    props: ['newItem', 'deleteItem'],
    computed: {
        isPoster: function() {
            if(!this.selectedType) return;
            return this.selectedType.value === 'mattePoster' || this.selectedType.value === 'glossyPoster';
        }
    },
    firebase: {
        itemTypes: firebase.database().ref('itemTypes')
    },
    methods: {
        toggleForm: function() {
            this.isFormVisible = !this.isFormVisible;
        },
        clearForm: function() {
            this.selectedType = null;
            this.posterLength = null;
            this.posterWidth = null;
            this.qty = null;
        },
        addItemSubmit: function() {
            if(!this.selectedType) {
                alert('Choose an item type.')
                return;
            }
            let name = '';
            let cost = this.selectedType.price.num;
            if(this.selectedType.value.toLowerCase().indexOf('poster') > -1) {
                // calculate cost of poster
                let l = this.posterLength;
                let w = this.posterWidth;
                let side;
                const MAX_WIDTH = 41;

                if(l > MAX_WIDTH)
                    side = l;
                else if(l < w)
                    side = l;
                else
                    side = w;

                cost = side * this.selectedType.price.num;
                name = this.posterLength + 'x' + this.posterWidth + ' ';
            }
            name += this.selectedType.label;
            let item = {
                name: name,
                qty: this.qty,
                cost: cost
            };
            this.newItem(item);
            this.clearForm();
        },
        fetchItemTypes: function() {
            // firebase.database().ref('itemTypes').once('value').then((snapshot) => {
            //     this.itemTypes = snapshot.val();
            // });
        },
        applyPreset: function(e) {
            let size = e.target.value;
            if(!size) return;
            size = size.split('x');
            this.posterLength = size[0];
            this.posterWidth = size[1];
        }
    }
});

Vue.component('item-table', {
    template: '#item-table',
    props: {
        items: Object,
        showTotalRow: { type: Boolean, default: true },
        editable: { type: Boolean, default: false },
        updateItem: Function,
        deleteItem: Function,
        showPlaceholder: Boolean,
    },
    computed: {
        parsedItems: function() {
            let items = this.items;

            if(this.itemsEmpty && this.showPlaceholder === true)
                items[0] = {name: '...', cost: 0, qty: 0 };
            else if(this.itemsEmpty)
                return {};

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
            if(!this.items)
                return true;
            return Object.keys(this.items).length === 0;
        },
        total: function() {
            return this.calculateTotal(this.items);
        }
    }
});

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
