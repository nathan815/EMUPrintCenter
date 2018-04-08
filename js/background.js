const BASE_URL = 'https://ebill.emich.edu/C20704_ustores/';
let currentState = 'DEFAULT';
let currentTotal = 0;
let currentItems = {};
let currentOrder = {};

function deleteSiteSessionCookie() {
    chrome.cookies.remove({
        url: BASE_URL,
        name: 'JSESSIONID'
    });
}

function changeState(s) {
    currentState = s;
    console.log('state changed',s);
    sendMessage({
        action: 'stateChanged',
        state: s
    });
}

function orderFinished() {
    changeState('COMPLETE')
    // save order to firebase allOrders
    let orderRef = firebase.database().ref('allOrders').push();
    orderRef.set(currentOrder);
}

function handleRequest(request) {
    if(request.setState)
        changeState(request.setState);
    if(!request.action)
        return null;
    let returnData = {};
    switch(request.action) {
        case 'getCost':
            let cost = currentTotal;
            if(currentOrder.isSplitPayment && currentOrder.splitPayment.interdepartmentalAmount > 0
                && currentOrder.splitPayment.cardAmount > 0)
            {
                cost = currentOrder.splitPayment.cardAmount;
            }
            returnData = { cost: cost };
        break;
        case 'getCurrentOrder':
            returnData = { order: currentOrder, total: currentTotal };
        break;
        case 'currentState':
            returnData = { state: currentState };
        break;
        case 'cancelPayment':
            changeState('DEFAULT');
            deleteSiteSessionCookie();
        break;
        case 'cancelOrder':
            changeState('CANCEL');
            firebase.database().ref('currentOrder').set({
                completed: false,
                isReadyToPay: false,
                items: {}
            });
        break;
    }
    returnData['state'] = currentState;
    return returnData;
}

function sendMessageCurrentTab(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if(!tabs[0])
        return;
      chrome.tabs.sendMessage(tabs[0].id, data);
    });
}
function sendMessage(data) {
    chrome.runtime.sendMessage(data, function() {
        console.log('sent message',data);
    });
}

function calculateTotal(items) {
    let total = 0;
    if(!items || items.length === 0)
        return 0;
    items.forEach(function(item) {
        total += item.cost*item.qty;
    });
    return Math.round(total * 100) / 100;
}

let currentOrderRef = firebase.database().ref('currentOrder');
currentOrderRef.on('value', function(snapshot) {
    let order = snapshot.val();
    currentOrder = order;
    currentItems = order.items;
    currentTotal = calculateTotal(currentItems);

    if(order.isPaid)
        orderFinished();
    
    if(order.resetState)
        changeState('DEFAULT');

    sendMessage({ 
        action: 'currentOrderChanged',
        order: order,
        total: currentTotal
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse(handleRequest(request));
});
