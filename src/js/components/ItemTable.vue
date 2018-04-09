<script>
export default {
    props: {
        items: Object,
        showTotalRow: { type: Boolean, default: true },
        editable: { type: Boolean, default: false },
        updateItem: Function,
        deleteItem: Function,
        showPlaceholder: Boolean,
    },
    computed: {
        parsedItems: function() {
            let items = this.items;

            if(this.itemsEmpty && this.showPlaceholder === true)
                items[0] = {name: '...', cost: 0, qty: 0 };
            else if(this.itemsEmpty)
                return {};

            let parsedItems = {};
            for(let key in items) {
                let item = items[key];
                parsedItems[key] = {
                    name: item.name,
                    cost: item.cost ? '$' + this.moneyFormat(item.cost) : '...',
                    qty: item.qty ? item.qty : '...',
                    total: item.cost ? '$' + this.moneyFormat(item.cost*item.qty) : '...'
                };
            }
            return parsedItems;
        },
        itemsEmpty: function() {
            if(!this.items)
                return true;
            return Object.keys(this.items).length === 0;
        },
        total: function() {
            return this.calculateTotal(this.items);
        }
    }
}
</script>
<template>
    <div class="item-table-container">
        <p v-if="itemsEmpty">No items in order yet.</p>
        <table v-else class="item-table">
            <tr>
                <th class="product">Product</th>
                <th class="right">Cost</th>
                <th class="right">Qty</th>
                <th class="right">Total</th>
                <th v-if="editable && !itemsEmpty"></th>
            </tr>
            <tr v-for="(item,key) in parsedItems" :key="key">
                <td class="product">{{ item.name }}</td>
                <td class="right">{{ item.cost }}</td>
                <td v-if="editable" class="right">
                    <input type="number" v-model="items[key].qty" v-on:change="updateItem(key)" class="qty" min="1" />
                </td>
                <td v-else class="right">{{ item.qty }}</td>
                <td class="right">{{ item.total }}</td>
                <td v-if="editable && !itemsEmpty" class="right delete" title="Remove item from order">
                    <i class="fas fa-trash" v-on:click="deleteItem(key)"></i>
                </td>
            </tr>
        </table>
        <footer v-if="showTotalRow && total > 0">
            Total: <b>${{ total.toFixed(2) }}</b>
        </footer>
    </div>
</template>
