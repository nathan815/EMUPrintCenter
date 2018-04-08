const EMU_PAY_URL = 'https://ebill.emich.edu/C20704_ustores/web/product_detail.jsp?PRODUCTID=49&SINGLESTORE=true';
const PRINT_URL = '/receipt-print.html';

let app = new Vue({
    el: '#app',
    data: {
        currentState: 'BEGIN',
        currentOrder: {},
        total: 0
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
        moneyFormat: function(num) {
            return num % 1 === 0 ? num : num.toFixed(2);
        },
        openPayWindow: function() {
            this.sendMessage({ action: 'clearPaySiteSessionCookie' });
            this.setState('BEGIN', function() {
                let payWindow = window.open(EMU_PAY_URL);
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
            chrome.runtime.sendMessage({ setState: state }, function(response) {
                this.currentState = state;
                console.log('Set State = ' + state);
                if(cb) cb();
            });
        },
        sendMessage: function(data, cb) {
            chrome.runtime.sendMessage(data, function(response) {
                if(cb) cb();
            });
        }
    }
});
