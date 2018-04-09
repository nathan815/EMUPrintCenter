document.getElementById('open-attendant-ui').onclick = function() {
    let url = chrome.extension.getURL('/attendant.html');
    chrome.tabs.create({ url: url });
};
document.getElementById('open-customer-ui').onclick = function() {
    let url = chrome.extension.getURL('/customer.html');
    chrome.tabs.create({ url: url });
};
document.getElementById('change-state').onclick = function() {
    let newState = document.getElementById('new-state').value;
    if(newState)
        setState(newState);
}
document.getElementById('complete').onclick = function() {
    chrome.runtime.sendMessage({ action: 'paymentComplete' });
}

function setState(state) {
    chrome.runtime.sendMessage({ setState: state });
}

chrome.runtime.sendMessage({ action: 'currentState' }, function(response) {
    document.getElementById('state').innerText = response.state;
    document.getElementById('new-state').value = response.state;
});
chrome.runtime.onMessage.addListener((msg, sender, response) => {
    switch(msg.action) {
        case 'stateChanged':
            document.getElementById('state').innerText = msg.state;
            document.getElementById('new-state').value = msg.state;
        break;
    }
});
