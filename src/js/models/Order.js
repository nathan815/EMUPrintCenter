/*
 * Order Model
 * Default/new order structure
 */

export default {
    id: null,
    notes: null,
    contact: {
        name: null,
        email: null
    },
    items: {},
    datePaid: '',
    isPaid: false,
    isReadyToPay: false,
    isCard: false,
    isInterdepartmental: false,
    isSplitPayment: false,
    splitPayment: {
        cardAmount: 0,
        interdepartmentalAmount: 0
    }
};
