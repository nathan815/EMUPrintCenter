import Vue from 'vue';

import mixins from '../mixins';

import Customer from './Customer';

Vue.config.devtools = false;
Vue.config.productionTip = false;
Vue.mixin(mixins);

let app = new Vue({
    el: '#app',
    render: (h) => h(Customer)
});
