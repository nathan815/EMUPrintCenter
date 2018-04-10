<script>
import firebase from '../firebase';
import ItemAdder from '../components/ItemAdder';
import ItemTable from '../components/ItemTable';
import AddOrderModal from './AddOrderModal';

const db = firebase.database();
const ITEMS_PER_PAGE = 5;

export default {
    components: {
        'item-adder': ItemAdder,
        'item-table': ItemTable,
        'add-order-modal': AddOrderModal
    },
    data() {
        return {
            selectedFilter: 'all',
            showAddOrderModal: false
        };
    },
    firebase: {
        allOrders: db.ref('allOrders').limitToLast(ITEMS_PER_PAGE)
    },
    computed: {
        parsedOrders() {
            let orders = this.allOrders;
            if(!orders)
                return [];
            orders.reverse();
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
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        },
        beginPayment(order) {
            alert(order['.key'])
        },
        printReceipt(order) {
            alert(order['.key'])
        }
    }
}
</script>
<template>
    <section class="section orders">

        <header>
            <h2 class="pull-left">
                Orders
                <select v-model="selectedFilter">
                    <option value="all">All</option>
                    <option value="not-paid">Not Paid</option>
                    <option value="paid">Paid</option>
                </select>
            </h2>
            <button class="btn pull-right" v-on:click="showAddOrderModal = true"><i class="fas fa-plus"></i> Add Email Order</button>
        </header>

        <add-order-modal :show="showAddOrderModal" v-on:close="showAddOrderModal = false" ></add-order-modal>
        
        <div class="order" v-for="order in parsedOrders">
            <header>
                <h3>
                    Order: {{ order.id }} &nbsp; 
                    <a href="#" class="print" v-if="order.isPaid" v-on:click.prevent="printReceipt(order)">
                        <i class="fas fa-print"></i> Print
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
                   <item-table :items="order.items" :show-total-row="true" :show-placeholder="false"></item-table>
                </div>
            </div>
        </div>
        <button class="btn btn-light">Load more...</button>

    </section><!-- end section.orders-->
</template>
