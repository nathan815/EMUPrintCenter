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
        if(!items || items.length === 0)
            return 0;
        items.forEach(function(item) {
            total += item.cost*item.qty;
        });
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
            firebase.database().ref('itemTypes').once('value').then((snapshot) => {
                this.itemTypes = snapshot.val();
            });
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
        items: {
            type: Array
        },
        showTotalRow: {
            type: Boolean,
            default: true
        },
        editable: {
            type: Boolean,
            default: false
        },
        deleteItem: {
            type: Function
        },
        showPlaceholder: {
            type: Boolean
        },
    },
    computed: {
        parsedItems: function() {
            let items = this.items ? this.items : [];
            if(items.length === 0 && this.showPlaceholder === true)
                items.push({ name: '...', cost: 0, qty: 0 });
            else if(items.length === 0)
                return [];
            return items.map((item) => { 
                return {
                    name: item.name,
                    cost: item.cost ? '$' + this.moneyFormat(item.cost) : '...',
                    qty: item.qty ? item.qty : '...',
                    total: item.cost ? '$' + this.moneyFormat(item.cost*item.qty) : '...'
                };
            });
        },
        total: function() {
            return this.calculateTotal(this.items);
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        currentOrder: DEFAULT_CURRENT_ORDER,
        isSignedIn: true,
        cardAmount: 0,
        interdepartmentalAmount: 0
    },
    mounted: function() {
        this.firebaseListenCurrentOrder();
    },
    computed: {
        total: function() {
            return this.calculateTotal(this.currentOrder.items);
        }
    },
    watch: {
        currentOrder: {
            handler: function() {
                this.firebaseUpdateCurrentOrder();
            },
            deep: true
        }
    },
    methods: {
        signIn: function() {
            alert('sign in')
        },
        signOut: function() {
            alert('sign out')
        },
        newItemCurrentOrder: function(item) {
            if(!this.currentOrder)
                this.currentOrder = DEFAULT_CURRENT_ORDER;
            console.log('pushing',item)
            this.currentOrder.items.push(item);
        },
        deleteItemCurrentOrder: function(key) {
            console.log('before',this.currentOrder.items.length);
            let items = this.currentOrder.items;
            if(!items || items.length <= 0)
                return;
            items.splice(key,1)
            console.log('after',this.currentOrder.items.length);
        },
        selectPaymentMethod: function(method) {
            this.currentOrder.isSplitPayment = false;
            this.currentOrder.splitPayment = { cardAmount: 0, interdepartmentalAmount: 0 };
            this.currentOrder.isCard = false;
            this.currentOrder.isInterdepartmental = false;
            switch(method) {
                case 'card':
                    this.currentOrder.isCard = true;
                break;
                case 'inter':
                    this.currentOrder.isInterdepartmental = true;
                break;
                case 'card+inter':
                    this.currentOrder.isSplitPayment = true;
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
            this.currentOrder.isCard = false;
            this.currentOrder.isInterdepartmental = true;
            this.currentOrder.isPaid = true;
        },
        savePaymentSubmit: function(e) {
            let card = parseFloat(e.target.elements.card.value);
            let inter = parseFloat(e.target.elements.inter.value);
            if(card + inter !== this.total) {
                alert('The sum of both amounts must equal the total: $' + this.total +'. Card amount will be automatically calculated upon entering interdepartmental form amount.');
                return;
            }
            this.currentOrder.splitPayment = {
                cardAmount: card.toFixed(2),
                interdepartmentalAmount: inter.toFixed(2)
            };
            this.currentOrder.isCard = true;
        },
        readyToPay: function() {
            this.currentOrder.isReadyToPay = true;
        },
        editOrder: function() {
            this.selectPaymentMethod('none');
            this.currentOrder.isReadyToPay = false;
        },
        clearScreen: function() {
            let order = {
                ...DEFAULT_CURRENT_ORDER,
                resetState: true
            };
            this.currentOrder = order;
        },
        cancelOrder: function() {
            alert('cancel')
        },
        firebaseUpdateCurrentOrder() {
            let ref = firebase.database().ref('currentOrder');
            ref.set(this.currentOrder);
        },
        firebaseListenCurrentOrder() {
            let ref = firebase.database().ref('currentOrder');
            ref.on('value', (snapshot) => {
                let order = snapshot.val() ? snapshot.val() : DEFAULT_CURRENT_ORDER;
                // make sure the order object has all keys it should have
                for(let key in DEFAULT_CURRENT_ORDER) {
                    if(!order.hasOwnProperty(key))
                        order[key] = DEFAULT_CURRENT_ORDER[key];
                }
                this.currentOrder = order;
            });
        },
    }
});
