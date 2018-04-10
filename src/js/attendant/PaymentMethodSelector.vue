<script>
export default {
    props: {

    },
    methods: {
        selectPaymentMethod(type) {
            this.$emit('selected', type);
        }
    }
}
</script>
<template>
    <div>
        Payment Method <i class="fas fa-arrow-right"></i> &nbsp;
        <button class="btn btn-light" v-on:click="selectPaymentMethod('card')">
            <i class="far fa-credit-card"></i> Card
        </button>
        <button class="btn btn-light" v-on:click="selectPaymentMethod('inter')">
            <i class="fas fa-exchange-alt"></i> Interdepartmental
        </button>
        <button class="btn btn-light" v-on:click="selectPaymentMethod('card+inter')">
            <i class="far fa-credit-card"></i> Card + <i class="fas fa-exchange-alt"></i> Interdepartmental
        </button>
    </div>
</template>
