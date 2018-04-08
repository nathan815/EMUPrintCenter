const BASE_URL = 'https://ebill.emich.edu/C20704_ustores/';
let currentState = 'DEFAULT';
let currentTotal = 0;
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

function orderComplete() {
    changeState('COMPLETE')
    currentOrder.datePaid = new Date().toISOString();
    currentOrder.isPaid = true;
    // save order to allOrders
    let pushRef = firebase.database().ref('allOrders').push();
    pushRef.set(currentOrder);
    currentOrder.isSaved = true;
    // update currentOrder
    firebase.database().ref('currentOrder').set(currentOrder);
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
        case 'paymentComplete':
            orderComplete();
        break;
        case 'cancelPayment':
            changeState('DEFAULT');
            deleteSiteSessionCookie();
        break;
        case 'cancelOrder':
            changeState('DEFAULT');
            deleteSiteSessionCookie();
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
    if(!items)
        return 0;
    for(let key in items) {
        total += items[key].cost * items[key].qty;
    }
    return Math.round(total * 100) / 100;
}

let currentOrderRef = firebase.database().ref('currentOrder');
currentOrderRef.on('value', function(snapshot) {
    let order = snapshot.val();
    currentOrder = order;
    currentTotal = calculateTotal(currentOrder.items);

    if(order.isPaid && !order.isSaved) {
        orderComplete();
    }

    if(order.resetState) {
        console.log('resetting',order);
        changeState('DEFAULT');
        // clear out temporary properties from currentOrder
        currentOrder.resetState = null;
        currentOrder.isSaved = null;
        firebase.database().ref('currentOrder').set(currentOrder);
        // close payment window if it is open
        chrome.tabs.query({ url: BASE_URL + '*' }, function(tabs) {
            if(!tabs || !tabs[0]) return;
            chrome.tabs.sendMessage(tabs[0].id, { action: 'closePaymentWindow' }, function(response) {
                deleteSiteSessionCookie();
            });
        });
    }

    sendMessage({ 
        action: 'currentOrderChanged',
        order: order,
        total: currentTotal
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse(handleRequest(request));
});
