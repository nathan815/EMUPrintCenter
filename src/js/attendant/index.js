import Vue from 'vue';

import VueSelect from 'vue-select';
import VueFire from 'vuefire';

import mixins from '../mixins';

import Attendant from './Attendant';
import ItemTable from '../components/ItemTable';
import ItemAdder from '../components/ItemAdder';
import ManageCurrentOrder from './ManageCurrentOrder';
import ManageAllOrders from './ManageAllOrders';

Vue.config.devtools = false;
Vue.config.productionTip = false;
Vue.mixin(mixins);

// Initialize Components
Vue.use(VueFire);
Vue.component('v-select', VueSelect);
Vue.component('item-table', ItemTable);
Vue.component('item-adder', ItemAdder);
Vue.component('manage-current-order', ManageCurrentOrder);
Vue.component('manage-all-orders', ManageAllOrders);

const app = new Vue({
    el: '#app',
    render: (h) => h(Attendant)
});
