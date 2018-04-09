import Vue from 'vue';

import mixins from '../mixins';

import ItemTable from '../components/ItemTable';
import Customer from './Customer';

Vue.mixin(mixins);

let app = new Vue({
    el: '#app',
    render: (h) => h(Customer)
});
