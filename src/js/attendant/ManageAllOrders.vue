<script>
import firebase from '../firebase';
import ItemAdder from '../components/ItemAdder';
import ItemTable from '../components/ItemTable';
import AddOrderModal from './AddOrderModal';

const db = firebase.database();
const ITEMS_TO_LOAD = 5;

export default {
    components: {
        'ItemAdder': ItemAdder,
        'ItemTable': ItemTable,
        'AddOrderModal': AddOrderModal
    },
    data() {
        return {
            selectedFilter: 'all',
            showAddOrderModal: false,
            allOrders: [],
            orderCount: 0,
            previousLength: 0,
            moreOrdersToLoad: true
        };
    },
    props: ['reload'],
    watch: {
        reload(reload) {
            if(reload === true) {
                this.reloadOrders();
            }
        }
    },
    mounted() {
        this.loadOrders(false);
    },
    computed: {
        parsedOrders() {
            let orders = this.allOrders ? this.allOrders.slice() : [];
            return orders.map( (order) => {
                order.formattedDate = this.parseDate(order.datePaid);
                order.id = order['.key'].substring(3,10).toUpperCase();
                if(order.isSplitPayment)
                    order.paymentMethod = 'Card + Inter. Transfer Form';
                else if(order.isCard)
                    order.paymentMethod = 'Card';
                else
                    order.paymentMethod = 'Inter. Transfer Form';

                order.paidText = order.isPaid ? 'Paid with ' + order.paymentMethod : 'Hasn\'t Paid';
                return order;
            });
        }
    },
    methods: {
        parseDate(date) {
            const d = new Date(date);
            if(isNaN(d))
                return '';
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        },
        beginPayment(order) {
            alert(order['.key']);
        },
        printReceipt(order) {
            alert(order['.key']);
        },
        loadedOrders(snapshot) {
            // changing to reverse chronological order (latest first)
            console.log(JSON.stringify(snapshot.val()));
            let arrayOfKeys = Object.keys(snapshot.val())
            .sort()
            .reverse();

            // transforming to array
            let results = arrayOfKeys
            .map((key) => {
                let order = snapshot.val()[key];
                order['.key'] = key;
                return order;
            });

            console.log(results)

            if(this.previousLength === results.length)
                this.moreOrdersToLoad = false;
            else
                this.allOrders = results;

            this.previousLength = results.length;
            this.$emit('loaded');
        },
        loadOrders(more = true, reset = false) {
            let query;
            let ref = db.ref('allOrders');
            ref.off();
            if(reset) {
                this.moreOrdersToLoad = true;
                this.previousLength = 0;
                this.orderCount = 0;
            }
            this.orderCount += ITEMS_TO_LOAD;
            switch(this.selectedFilter) {
                case 'all':
                    query = ref.orderByKey();
                break;
                case 'paid':
                    query = ref.orderByChild('isPaid').equalTo(true);
                break;
                case 'not-paid':
                    query = ref.orderByChild('isPaid').equalTo(false);
                break;
            }
            query.limitToLast(this.orderCount)
                 .once('value').then(this.loadedOrders);
        },
        loadMore() {
            this.loadOrders(true);
        },
        reloadOrders() {
            this.loadOrders(false,false);
        },
        resetOrders() {
            this.loadOrders(false,true);
        }
    }
}
</script>
<template>
    <section class="section orders">

        <header>
            <h2 class="pull-left">
                Orders
                <select v-model="selectedFilter" v-on:change="resetOrders()">
                    <option value="all">All</option>
                    <option value="not-paid">Not Paid</option>
                    <option value="paid">Paid</option>
                </select>
            </h2>
            <button class="btn pull-right" v-on:click="showAddOrderModal = true"><i class="fas fa-plus"></i> Add Email Order</button>
        </header>

        <AddOrderModal :show="showAddOrderModal" v-on:close="showAddOrderModal = false" v-on:added="reloadOrders()"></AddOrderModal>
        
        <div class="order" v-for="order in parsedOrders">
            <header>
                <h3>
                    Order: {{ order.id }} &nbsp; 
                    <a href="#" class="print" v-if="order.isPaid" v-on:click.prevent="printReceipt(order)">
                        <i class="fas fa-print"></i> Print
                    </a>
                    <a href="#" class="print" v-else v-on:click.prevent="printReceipt(order)">
                        <i class="fas fa-trash"></i> Delete
                    </a>
                </h3>
                <div class="header-details">
                    <span class="paid" :class="{'not':!order.isPaid}">{{ order.paidText }}</span> 
                    <br>
                    <a href="#" v-if="!order.isPaid" v-on:click.prevent="beginPayment(order)"><i class="fas fa-arrow-up"></i> Move to Customer Screen</a>
                    <span v-else>on {{ order.formattedDate }}</span>
                </div>
            </header>
            <div class="details">
                <p class="contact" v-if="order.contact"><i>Contact:</i> {{order.contact.name}} &bull; {{order.contact.email}}</p>
                <p class="notes" v-if="order.notes"><i>Notes:</i> {{order.notes}}</p>
                <div class="items">
                   <ItemTable :items="order.items" :show-total-row="true" :show-placeholder="false"></ItemTable>
                </div>
            </div>
        </div>
        <button class="btn btn-light" :disabled="!moreOrdersToLoad" v-on:click="loadMore()" >
            {{ moreOrdersToLoad ? 'Load more...' : 'No more orders to load' }}
        </button>

    </section><!-- end section.orders-->
</template>
