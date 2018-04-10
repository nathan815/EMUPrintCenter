<script>
export default {
    data() {
        return {
            cardAmount: 0,
            interdepartmentalAmount: 0,
        }
    },
    props: {
        currentOrder: { type: Object, required: true },
        updateCurrentOrder: { type: Function, required: true },
        total: Number
    },
    methods: {
        submit(event) {
            let card = parseFloat(event.target.elements.card.value);
            let inter = parseFloat(event.target.elements.inter.value);
            if(card + inter !== this.total) {
                alert('The sum of both amounts must equal $' + this.total + '. ' +
                      'Card amount will be automatically calculated upon entering amount for interdepartmental form.');
                return;
            }
            this.updateCurrentOrder({
                ...this.currentOrder,
                splitPayment: {
                    cardAmount: card.toFixed(2),
                    interdepartmentalAmount: inter.toFixed(2)
                },
                isCard: true
            });
        },
        updateInterdepartmentalAmount(event) {
            let val = event.target.value;
            if(val > this.total) return;
            this.interdepartmentalAmount = val;
            this.cardAmount = this.total - val;
        },
    }
}
</script>
<template>
    <div v-if="currentOrder.isReadyToPay && currentOrder.isSplitPayment" class="split-payment-panel">

        <div v-if="currentOrder.splitPayment.cardAmount > 0 || currentOrder.splitPayment.interdepartmentalAmount > 0" class="payment-box">
            <u>Split Payment Method</u>
            <br>
            Interdepartmental Form: <b>${{ currentOrder.splitPayment.interdepartmentalAmount }}</b>
            <br>
            Charge to Card: <b>${{ currentOrder.splitPayment.cardAmount }}</b>
        </div>

        <div v-if="!currentOrder.isCard" class="split-payment payment-box">
            <u>Split Payment Method</u>
            <br>
            <br>
            <form class="styled" v-on:submit.prevent="submit">
                <div class="input-group">
                    <label>Amount covered by interdepartmental transfer form:</label> <br>
                    $<input type="number" class="control" name="inter" required min="1" :max="total" step="0.01" 
                    :value="interdepartmentalAmount" v-on:input="updateInterdepartmentalAmount" />
                </div>
                <div class="input-group">
                    <label>Amount to charge to card:</label> <br>
                    $<input type="number" class="control" name="card" required min="0" :max="total" step="0.01" :value="cardAmount" />
                </div>
               
                <button class="btn" type="submit">Submit</button>
            </form>
        </div>

    </div>
</template>
