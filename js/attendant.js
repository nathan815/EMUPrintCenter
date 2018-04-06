Vue.component('item-table', {
    template: '#item-table',
    data: function() {
        return {
            items: [
                {
                    name: '54x40 Matte Poster',
                    qty: 1,
                    cost: 27
                }
            ]
        };
    },
    computed: {
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
    }
});

let app = new Vue({
    el: '#app',
    data: {
        currentOrder: null,
        isSignedIn: true,
        isCurrentOrder: false,
        isCurrentOrderComplete: false
    },
    mounted: function() {

    },
    methods: {
        signIn: function() {
            alert('sign in')
        },
        signOut: function() {
            alert('sign out')
        }
    }
});
