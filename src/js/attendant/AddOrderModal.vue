<script>
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
            currentKey: 0
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
            <form class="styled add-item" v-on:submit.prevent="" autocomplete="off">
                <h4>Contact information</h4>
                <input type="text" placeholder="Name" name="name" class="half-width" autocomplete="off"  />
                <input type="email" placeholder="Email address" name="email" class="half-width" autocomplete="off"  />
                <h4>Notes</h4>
                <textarea placeholder="Add notes or specific instructions (optional)" name="notes"></textarea>
            </form>
        </div>
        <span slot="close-btn">Cancel</span>
        <span slot="buttons">
            <button class="btn">
                <i class="fas fa-check-circle"></i> Save Order
            </button>
        </span>
    </modal>
</template>
