import Vue from 'vue';
import VueFire from 'vuefire';
import VueSelect from 'vue-select';

import Attendant from './Attendant';

import mixins from '../mixins';

Vue.config.devtools = false;
Vue.config.productionTip = false;
Vue.mixin(mixins);

// Initialize Components
Vue.use(VueFire);
Vue.component('v-select', VueSelect);

const app = new Vue({
    el: '#app',
    render: (h) => h(Attendant)
});
