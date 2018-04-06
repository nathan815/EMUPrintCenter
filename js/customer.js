const EMU_PAY_URL = 'https://ebill.emich.edu/C20704_ustores/web/product_detail.jsp?PRODUCTID=49&SINGLESTORE=true';
const PRINT_URL = '/receipt-print.html';

let app = new Vue({
    el: '#app',
    data: {
        currentState: 'BEGIN',
        currentOrder: null,
        total: 0
    },
    mounted: function() {
        this.getState();
        this.getCurrentOrder();
        this.listenForMessages();
    },
    computed: {
        isOrderComplete: function() {
            return this.currentState === 'COMPLETED';
        },
        parsedItems: function() {
            if(!this.currentOrder || !this.currentOrder.items) return;
            if(this.currentOrder.items.length <= 0)
                this.currentOrder.items.push({ name: '...', cost: 0, qty: 0 });
            return this.currentOrder.items.map((item) => { 
                return {
                    name: item.name,
                    cost: item.cost ? '$' + this.moneyFormat(item.cost) : '...',
                    qty: item.qty ? item.qty : '...',
                    total: item.cost ? '$' + this.moneyFormat(item.cost*item.qty) : '...'
                };
            });
        }
    },
    methods: {
        moneyFormat: function(num) {
            return num % 1 === 0 ? num : num.toFixed(2);
        },
        clearOrder: function() {
            //this.items = [];
        },
        orderCancelled: function() {
            this.clearOrder();
        },
        orderCompleted: function() {
            //this.isOrderComplete = true;
        },
        openPayWindow: function() {
            this.sendMessage({ action: 'clearPaySiteSessionCookie' });
            this.setState('BEGIN', function() {
                let payWindow = window.open(EMU_PAY_URL);
                //this.pollPayWindowClosed(payWindow);
            });
        },
        pollPayWindowClosed: function(winObj) {
            var loop = setInterval(() => {   
                console.log('checking if window closed')
                if(winObj.closed) {  
                    console.log('window is closed')
                    clearInterval(loop);  
                    this.payWindowClosed();
                }
            }, 1500);
        },
        payWindowClosed: function() {
            this.setState('DEFAULT');
        },
        printReceipt: function() {
            let w = window.open(PRINT_URL);
            let date = new Date(this.currentOrder.dateCompleted);
            w.onload = function() {
                w.document.getElementById('receipt-data').innerHTML = document.getElementById('receipt').innerHTML;
                w.document.getElementById('date').innerHTML = date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
                w.document.getElementById('paid-with').innerHTML = 'Paid with Card';
            };
        },
        handleStateChange: function(state) {
            console.log('state changed: ',state);
            this.currentState = state;
            switch(state) {
                case 'BEGIN':
                break;
                case 'COMPLETED':
                    //this.orderCompleted();
                break;
                case 'CANCEL':
                    this.orderCancelled();
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
