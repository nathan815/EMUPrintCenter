<script>
import appConfig from '../app-config';
import firebase from '../firebase';
import ItemAdder from '../components/ItemAdder';
import ItemTable from '../components/ItemTable';
import AddOrderModal from './AddOrderModal';

const db = firebase.database();
const ITEMS_TO_LOAD = 5;

export default {
    components: {
        ItemAdder, ItemTable, AddOrderModal
    },
    data() {
        return {
            selectedFilter: 'all',
            showAddOrderModal: false,
            moreOrdersToLoad: true,
            loadingOrders: true,
            allOrders: [],
            orderKeys: [],
            orderCount: ITEMS_TO_LOAD,
        };
    },
    mounted() {
        this.loadOrders(false);
    },
    computed: {
        parsedOrders() {
            let orders = JSON.parse(JSON.stringify(this.allOrders));
            return orders.map( (order) => {
                order.formattedDate = this.parseDate(order.datePaid);
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
        printReceipt(order) {
            let w = window.open(appConfig.PRINT_URL);
            w.printData = {
                currentOrder: order,
                receiptHtml: document.getElementById('order-items-'+order.id).outerHTML
            };
        },
        beginPayment(index, id) {
            let order = {...this.allOrders[index]};
            let key = order['.key'];
            delete order['.key'];
            order.id = id;
            db.ref('currentOrder').once('value').then((snapshot) => {
                let currentOrder = snapshot.val();
                if(currentOrder.id || this.isObjectEmpty(currentOrder.items)) {
                    db.ref('currentOrder').set(order);
                    db.ref('allOrders').child(key).child('hide').set(true);
                    window.scrollTo(0, 0);
                }
                else {
                    alert('Please complete or cancel the current order before loading a previous order.');
                }
            });
        },
        deleteOrder(order) {
            if(!confirm('Are you sure you want to delete Order ' + order.id + '?'))
                return;
            db.ref('allOrders').child(order['.key']).remove();
        },
        loadedOrders(snapshot) {
            this.loadingOrders = false;
            if(!snapshot.val())
                return;
            // changing to reverse chronological order (latest first)
            console.log('loadedOrders',snapshot.val())
            let keys = Object.keys(snapshot.val())
            .sort()
            .reverse();

            // transforming to array
            let results = keys.map((key) => {
                let order = snapshot.val()[key];
                order['.key'] = key;
                return order;
            });

            this.moreOrdersToLoad = this.orderKeys.length === 0;
            for(let key in keys) {
                if(!this.orderKeys.hasOwnProperty(key)) {
                    this.moreOrdersToLoad = true;
                }
            }

            this.allOrders = results;
            console.log('updated orders',results)

            this.orderKeys = keys;
            this.$emit('loaded');
        },
        loadOrders(more = true, reset = false) {
            let ref = db.ref('allOrders');
            let query;
            ref.off();
            this.loadingOrders = true;
            if(reset) {
                this.moreOrdersToLoad = true;
                this.orderKeys = [];
                this.orderCount = ITEMS_TO_LOAD;
            }
            if(more) {
                this.orderCount += ITEMS_TO_LOAD;
            }
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
                 .on('value', this.loadedOrders);
        },
        loadMore() {
            this.loadOrders(true);
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
            <button class="btn pull-right" v-on:click="showAddOrderModal = true">
                <i class="fas fa-envelope"></i> Add Email Order
            </button>
        </header>

        <AddOrderModal :show="showAddOrderModal" v-on:close="showAddOrderModal = false"></AddOrderModal>
        
        <div class="order" v-for="(order,index) in parsedOrders">
            <header>
                <h3>
                    Order: {{ order.id }} &nbsp; 
                    <a href="#" class="print" v-if="order.isPaid" v-on:click.prevent="printReceipt(order)">
                        <i class="fas fa-print"></i> Print
                    </a>
                    <a href="#" class="print" v-else v-on:click.prevent="deleteOrder(order)">
                        <i class="fas fa-trash"></i> Delete
                    </a>
                </h3>
                <div class="header-details">
                    <span class="paid" :class="{'not':!order.isPaid}">{{ order.paidText }}</span> 
                    <br>
                    <a href="#" v-if="!order.isPaid" v-on:click.prevent="beginPayment(index, order.id)"><i class="fas fa-arrow-up"></i> Move to Customer Screen</a>
                    <span v-else>on {{ order.formattedDate }}</span>
                </div>
            </header>
            <div class="details">
                <p class="contact" v-if="order.contact"><i>Contact:</i> {{order.contact.name}} &bull; {{order.contact.email}}</p>
                <p class="notes" v-if="order.notes"><i>Notes:</i> {{order.notes}}</p>
                <div class="items">
                   <ItemTable :items="order.items" :id="'order-items-' + order.id" :showTotalRow="true" :showPlaceholder="false"></ItemTable>
                </div>
            </div>
        </div>
        <button class="btn btn-light" :disabled="!moreOrdersToLoad || loadingOrders" v-on:click="loadMore()" >
            {{ loadingOrders ? 'Loading...' : (moreOrdersToLoad ? 'Load more...' : 'No more orders to load') }}
        </button>

    </section><!-- end section.orders-->
</template>
