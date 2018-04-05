const EMU_PAY_URL = 'https://ebill.emich.edu/C20704_ustores/web/product_detail.jsp?PRODUCTID=49&SINGLESTORE=true';
const EMU_PRINT_URL = 'https://ebill.emich.edu/C20704_ustores/web/classic/print_order_receipt.jsp?INCLUDE_SCHEDULE=true';

var app = new Vue({
    el: '#app',
    data: {
        currentState: 'BEGIN',
        items: [],
        total: 0,
        isReadyToPay: false
    },
    mounted: function() {
        this.getState();
        this.getItems();
        this.listenForMessages();
    },
    computed: {
        isOrderFinished: function() {
            return this.currentState === 'COMPLETED';
        },
        parsedItems: function() {
            if(!this.items) return;
            if(this.items.length <= 0)
                this.items.push({ name: '...', cost: 0, qty: 0 });
            return this.items.map((item) => {
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
            this.items = [];
        },
        orderCancelled: function() {
            this.clearOrder();
        },
        orderCompleted: function() {
            //this.isOrderFinished = true;
        },
        openPayWindow: function() {
            this.setState('BEGIN', function() {
                let payWindow = window.open(EMU_PAY_URL);
                this.pollPayWindowClosed(payWindow);
            });
        },
        pollPayWindowClosed: function(winObj) {
            var loop = setInterval(() => {   
                if(winObj.closed) {  
                    clearInterval(loop);  
                    this.payWindowClosed();
                }
            }, 650);
        },
        payWindowClosed: function() {
            this.getState((state) => {
                if(state === 'CANCEL')
                    this.orderCancelled();
                else if(state === 'COMPLETED')
                    this.orderCompleted();
                this.setState('BEGIN');
            });
        },
        printReceipt: function() {
            let w = window.open();
            w.document.write('<html><head><title>EMU Print Center Receipt</title>');
            w.document.write('<link href="css/receipt-print.css" rel="stylesheet" />');
            w.document.write('</head><body>');
            w.document.write('<div class="bar">Printing your receipt, please wait...</div>');
            w.document.write('<div class="content"><h3>EMU Print Center Receipt</h3>');
            //w.document.write('<p>Date: ' + new Date().toLocaleDateString("en-US") + '</p>');
            w.document.write('<p>Date: ' + new Date().toLocaleDateString("en-US") + '</p>');
            w.document.write(document.getElementById('receipt').innerHTML);
            w.document.write('</div></body></html>');

            let script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', 'js/receipt-print.js');
            w.document.body.appendChild(script);
            w.document.close();
        },
        handleStateChange: function(state) {
            console.log('state changed: ',state);
            this.currentState = state;
            switch(state) {
                case 'BEGIN':
                break;
                case 'COMPLETED':
                    this.orderCompleted();
                    //setTimeout(this.clearOrder, 4000);
                break;
                case 'CANCEL':
                    this.orderCancelled();
                    this.setState('BEGIN');
                break;
            };
        },
        listenForMessages: function() {
            chrome.runtime.onMessage.addListener((msg, sender, response) => {
                console.log('message recieved: ', msg);
                switch(msg.action) {
                    case 'stateChanged':
                        this.handleStateChange(msg.state);
                    break;
                    case 'currentOrderChanged':
                        this.items = msg.order.items;
                        this.total = msg.total;
                        this.isReadyToPay = msg.order.isReadyToPay;
                    break;
                    case 'clearOrder':
                        this.clearOrder();
                    break;
                }
            });
        },
        getItems: function() {
            chrome.runtime.sendMessage({ action: 'getCurrentOrder' }, (response) => {
                this.items = response.order.items;
                this.total = response.total;
                this.isReadyToPay = response.order.isReadyToPay;
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
        }
    }
});
