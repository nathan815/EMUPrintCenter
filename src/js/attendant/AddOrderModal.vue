<script>
import firebase from '../firebase';
import OrderModel from '../models/Order';

import Modal from '../components/Modal';
import ItemAdder from '../components/ItemAdder';
import ItemTable from '../components/ItemTable';

export default {
    components: {
        'modal': Modal,
        'item-table': ItemTable,
        'item-adder': ItemAdder,
    },
    data() {
        return {
            items: {},
            currentKey: 0,
            name: '',
            email: '',
            notes: ''
        }
    },
    props: {
        show: { type: Boolean, default: false }
    },
    methods: {
        // have to use .$set and .$delete here because just adding/deleting 
        // properties won't allow vue to detect the changes
        newItem(item) {
            this.$set(this.items, this.currentKey++, item);
        },
        updateItem(key, item) {
            this.$set(this.items, key, item);
        },
        deleteItem(key) {
            this.$delete(this.items, key);
        },
        save() {
            if(this.isObjectEmpty(this.items)) {
                alert('Add at least one item to the order.');
                return;
            }
            const items = this.items;
            const orderRef = firebase.database().ref('allOrders').push({
                ...OrderModel,
                contact: {
                    name: this.name ? this.name : null,
                    email: this.email ? this.email : null
                },
                notes: this.notes ? this.notes : null
            });
            // push all items to the new firebase object with Push IDs
            for(let key in items) {
                orderRef.child('items').push(items[key]);
            }
            this.clear();
            this.$emit('added');
            this.$emit('close');
        },
        clear() {
            this.items = {};
            this.name = '';
            this.email = '';
            this.notes = '';
        }
    }
}
</script>
<template>
    <modal v-on:close="$emit('close')" :show="show" class="add-order-modal">
        <b slot="header">Add Email Order</b>
        <div slot="body">
            <item-table :items="items" :show-total-row="true" :show-no-items-message="true"
                        :delete-item="deleteItem" :update-item="updateItem"
                        :editable="true" :show-placeholder="false">
            </item-table>
            <item-adder :new-item="newItem"></item-adder>
            <form v-on:submit.prevent="" class="styled add-item" ref="form" autocomplete="off">
                <h4>Contact information</h4>
                <input type="text" placeholder="Name" name="name" class="half-width" v-model="name" />
                <input type="email" placeholder="Email address" name="email" class="half-width" v-model="email" />
                <h4>Notes</h4>
                <textarea placeholder="Add notes or specific instructions (optional)" name="notes" v-model="notes"></textarea>
            </form>
        </div>
        <span slot="close-btn">Cancel</span>
        <span slot="buttons">
            <button class="btn" v-on:click="save()">
                <i class="fas fa-check-circle"></i> Save Order
            </button>
        </span>
    </modal>
</template>
