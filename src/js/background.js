import appConfig from './app-config';

let currentState = 'DEFAULT';
let currentTotal = 0;
let currentOrder = {};

function changeState(s) {
    currentState = s;
    console.log('state changed',s);
    sendMessage({
        action: 'stateChanged',
        state: s
    });
}

function deleteSiteSessionCookie() {
    chrome.cookies.remove({
        url: appConfig.BASE_URL,
        name: 'JSESSIONID'
    });
}

function closePaymentWindow() {
    // query tabs for the emich ebill url
    chrome.tabs.query({ url: appConfig.BASE_URL + '*' }, function(tabs) {
        if(!tabs || !tabs[0]) return;
        // send message to content script, and then delete the site's session cookie
        chrome.tabs.sendMessage(tabs[0].id, { action: 'closePaymentWindow' }, function(response) {
            deleteSiteSessionCookie();
        });
    });
}

function currentOrderChanged(order, total) {
    currentOrder = order;
    currentTotal = total;
}

function handleMessage(msg) {
    if(msg.setState)
        changeState(msg.setState);
    if(!msg.action)
        return null;
    let returnData = {};
    switch(msg.action) {
        case 'getCost':
            let cost = currentTotal;
            if(currentOrder.isSplitPayment && currentOrder.splitPayment.interdepartmentalAmount > 0
                && currentOrder.splitPayment.cardAmount > 0)
            {
                cost = currentOrder.splitPayment.cardAmount;
            }
            returnData = { cost: cost };
        break;
        case 'currentOrderChanged':
            currentOrderChanged(msg.data, msg.total);
        break;
        case 'getCurrentOrder':
            returnData = { order: currentOrder, total: currentTotal };
        break;
        case 'currentState':
            returnData = { state: currentState };
        break;
        case 'closePaymentWindow':
            closePaymentWindow();
        break;
        case 'paymentComplete':
            changeState('COMPLETE');
        break;
        case 'cancelPayment':
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

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    sendResponse(handleMessage(msg));
});
