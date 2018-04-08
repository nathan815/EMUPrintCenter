if(!window.printData) {
    alert('No order data received. Make sure to click the "Print Receipt" button directly from the interface.');
}

let currentOrder = window.printData.currentOrder;

let date = new Date(currentOrder.datePaid);
let paidWith = 'Paid with';

if(currentOrder.isSplitPayment) {
    paidWith += ':<br> - Interdepartmental Transfer Form: $' + currentOrder.splitPayment.interdepartmentalAmount;
    paidWith += '<br> - Card: $' + currentOrder.splitPayment.cardAmount;
}
else if(currentOrder.isInterdepartmental) {
    paidWith += ' Interdepartmental Transfer Form';
}
else if(currentOrder.isCard) {
    paidWith += ' Card';
}

window.onload = function() {
    window.document.getElementById('receipt-data').innerHTML = window.printData.receiptHtml;
    window.document.getElementById('date').innerHTML = 'Order Processed ' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    window.document.getElementById('paid-with').innerHTML = paidWith;

    window.print();
    
    setTimeout(function() {
        window.close();
    }, 2000);
};
