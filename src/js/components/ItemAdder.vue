<script>
import firebase from '../firebase';
const db = firebase.database();
export default {
    data() {
        return {
            isFormVisible: false,
            selectedType: null,
            itemTypes: [],
            presetSizes: [ {w:40,l:54}, {w:36,l:48}, {w:24,l:36}, {w:18,l:24} ],
            posterWidth: null,
            posterLength: null,
            qty: null
        }
    },
    props: {
        newItem: Function, 
        presetText: { type: String, default: 'Preset' }
    },
    computed: {
        isPoster() {
            if(!this.selectedType) return;
            return this.selectedType.value === 'mattePoster' || this.selectedType.value === 'glossyPoster';
        }
    },
    firebase: {
        itemTypes: db.ref('itemTypes')
    },
    methods: {
        toggleForm() {
            this.isFormVisible = !this.isFormVisible;
        },
        clearForm() {
            this.selectedType = null;
            this.posterLength = null;
            this.posterWidth = null;
            this.qty = null;
        },
        addItemSubmit() {
            if(!this.selectedType) {
                alert('Choose an item type.')
                return;
            }
            let name = '';
            let cost = this.selectedType.price.num;
            if(this.selectedType.value.toLowerCase().indexOf('poster') > -1) {
                // calculate cost of poster
                let l = this.posterLength;
                let w = this.posterWidth;
                let side;
                const MAX_WIDTH = 41;

                if(l > MAX_WIDTH)
                    side = l;
                else if(l < w)
                    side = l;
                else
                    side = w;

                cost = side * this.selectedType.price.num;
                name = this.posterLength + 'x' + this.posterWidth + ' ';
            }
            name += this.selectedType.label;
            let item = {
                name: name,
                qty: this.qty,
                cost: cost
            };
            this.newItem(item);
            this.clearForm();
        },
        applyPreset(event) {
            let size = event.target.value;
            if(!size) return;
            size = size.split('x');
            this.posterLength = size[0];
            this.posterWidth = size[1];
        }
    }
}
</script>
<template>
    <div class="item-adder">
        <button type="submit" class="btn btn-light" v-on:click="toggleForm()" v-if="!isFormVisible">
            <i class="fas fa-plus"></i> Add Item
        </button>

        <form class="styled" v-on:submit.prevent="addItemSubmit" v-if="isFormVisible">
            <div class="input-group">
                <input type="text" required v-model="selectedType" class="v-select-input-proxy" />
                <v-select v-model="selectedType" :options="itemTypes" placeholder="Choose item type..."></v-select>
            </div>
            
            <div class="input-group" v-if="isPoster">
                <input required type="number" placeholder="Length (in)" min="1" class="control" v-model="posterLength" /> &times;
                <input required type="number" placeholder="Width (in)" min="1" max="41" class="control" v-model="posterWidth" />
                <select v-on:change="applyPreset" class="preset-size">
                    <option value="null">{{ presetText }}</option>
                    <option v-for="size in presetSizes" :value="size.l+'x'+size.w">{{ size.l }} x {{ size.w }}</option>
                </select>
                <br>
                <span class="help"><i>Length > 54" won't fit in cutting board.</i> <b>Max printable width is 41".</b></span>
            </div>

            <input required type="number" min="1" name="qty" placeholder="Quantity" class="control" v-model="qty" />
            <br>

            <div class="buttons">
                <button type="submit" class="btn btn-light">
                    <i class="fas fa-plus"></i>  Add Item
                </button>
                <small><a href="#" v-on:click.prevent="toggleForm()">Close</a></small>
            </div>
        </form>

    </div>
</template>
