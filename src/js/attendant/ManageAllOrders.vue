<script>
import firebase from '../firebase';
import ItemTable from '../components/ItemTable';
const db = firebase.database();
const ITEMS_PER_PAGE = 5;
export default {
    components: {
        'item-table': ItemTable
    },
    data() {
        return {
            selectedFilter: 'all'
        };
    },
    firebase: {
        allOrders: db.ref('allOrders').startAt(this.lastOrderId).limitToLast(ITEMS_PER_PAGE)
    },
    computed: {
        parsedOrders() {
            let orders = this.allOrders;
            if(!orders)
                return [];
            orders.reverse();
            return orders.map( (order) => {
                const formattedDate = this.parseDate(order.datePaid);
                order.id = order['.key'].substring(1,8);
                order.paidText = order.isPaid ? 'Paid ' + formattedDate : 'Hasn\'t Paid';
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
            <button class="btn pull-right"><i class="fas fa-plus"></i> Add Email Order</button>
        </header>
        
        <div class="order" v-for="order in parsedOrders">
            <header>
                <h3>Order {{ order.id }}</h3>
                <div class="header-details">
                    <span class="paid" :class="{'not':!order.isPaid}">{{ order.paidText }}</span> 
                    <br>
                    <a href="#" v-if="!order.isPaid" v-on:click.prevent="beginPayment(order)"><i class="fas fa-arrow-up"></i> Move to Customer Screen</a>
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
