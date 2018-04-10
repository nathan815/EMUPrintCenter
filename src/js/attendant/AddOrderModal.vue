<script>
import Modal from '../components/Modal';
import ItemAdder from '../components/ItemAdder';
export default {
    components: {
        'modal': Modal,
        'item-adder': ItemAdder,
    },
    data() {
        return {
            
        }
    },
    props: {
        show: { type: Boolean, default: false }
    }
}
</script>
<template>
    <modal v-on:close="$emit('close')" :show="show" :classes="['add-order-modal']">
        <span slot="header">Add Email Order</span>
        <div slot="body">
            <form class="styled add-item" v-on:submit.prevent="">
                <h4>Contact Info</h4>
                <input type="text" placeholder="Name" />
                <input type="email" placeholder="Email address" />
                <h4>Items</h4>
                <item-adder></item-adder>
            </form>
        </div>
        <span slot="buttons">
            <button class="btn">Add Order</button>
        </span>
    </modal>
</template>
<style>
.add-order-modal {

}
</style>
