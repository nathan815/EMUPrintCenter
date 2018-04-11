export default {
    methods: {
        // capitalizeFirstLetter: str => str.charAt(0).toUpperCase() + str.slice(1),
        moneyFormat(num) {
            return num % 1 === 0 ? num : num.toFixed(2);
        },
        calculateTotal(items) {
            let total = 0;
            if(!items)
                return 0;
            for(let key in items) {
                total += items[key].cost * items[key].qty;
            }
            return Math.round(total * 100) / 100;
        },
        objectLength(obj) {
            return Object.keys(myObj).length;
        },
        isObjectEmpty(obj) {
            return Object.keys(myObj).length === 0;
        }
    }
}
