/*
 * Order Model
 * Default/new order structure
 */

export default {
    items: {},
    isReadyToPay: false,
    isCard: false,
    isInterdepartmental: false,
    isSplitPayment: false,
    splitPayment: {
        cardAmount: 0,
        interdepartmentalAmount: 0
    },
    isPaid: false,
    datePaid: '',
    contact: {
        name: null,
        email: null
    },
    notes: ''
};
