export default {
    deriveOrderId(key) {
        return key.substring(1,8).replace(/[\-_;]+/, '').toUpperCase();
    }
}
