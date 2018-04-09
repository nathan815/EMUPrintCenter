import Vue from 'vue';

import VueSelect from 'vue-select';
import VueFire from 'vuefire';

import mixins from '../mixins';
import ItemTable from '../components/ItemTable';
import ItemAdder from '../components/ItemAdder';

import Attendant from './Attendant';
import SplitPaymentPanel from './SplitPaymentPanel';

Vue.mixin(mixins);

// Initialize Components
Vue.use(VueFire);
Vue.component('v-select', VueSelect);
Vue.component('item-table', ItemTable);
Vue.component('item-adder', ItemAdder);
Vue.component('split-payment-panel', SplitPaymentPanel);

/**
  * Create Main App Vue Instance
  */

let app = new Vue({
    el: '#app',
    render: (h) => h(Attendant)
});
