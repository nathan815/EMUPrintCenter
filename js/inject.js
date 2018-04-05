const CART_URL = "/C20704_ustores/web/classic/shopping_cart.jsp";
let state = null;

function eleId(id) {
    return document.getElementById(id);
}

function fillCostInputAndContinue() {
    // Fill out total box and continue, if the input exists
    var costInput = eleId('ADD_ON_OFFER_USER_DEFINED_AMOUNT_49_49');
    if(costInput) {
        chrome.runtime.sendMessage({action: 'getCost',setState:'CART_CONTINUE'}, function(response) {
            console.log(response);
          costInput.value = response.cost;
          costInput.form.submit();
        });
    }
}

function goBack() {
    if( (1 < history.length) && document.referrer ) {
        history.back();
    }
    else {
        // If you can't go back in history, you could perhaps close the window ?
        window.close();
    }
}

function continueToCheckout() {
    var cartContinueForm = eleId('delivery_method_navigation_form');
    if(cartContinueForm)
        cartContinueForm.submit();
}

function getCurrentState() {
    chrome.runtime.sendMessage({action: 'currentState'}, function(response) {
        state = response.state;
        console.log('State = ',state);
        switch(response.state) {
            case 'BEGIN':
                fillCostInputAndContinue();
            break;
            case 'CART_CONTINUE':
                chrome.runtime.sendMessage({action: 'getCost',setState:'CHECKOUT'}, function() {
                    continueToCheckout();
                });
            break;
            case 'CHECKOUT':
                eleId('pos-checkout-toolbar').classList.add('checkout');
            break;
            case 'CANCEL':
            break;
            case 'COMPLETE':
                chrome.runtime.sendMessage({setState:'COMPLETE'}, function() {
                     window.print();
                     window.close();
                });
            break;
        }
    });
}

function cancelBtnEvent() {
    if(!confirm("Are you sure you want to cancel this order?"))
        return;
    chrome.runtime.sendMessage({action:'cancelOrder'}, function(response) {
        window.close();
    });
}
function showBackBtn() {
    let pageTitlesToShowBackBtn = ['Payment Methods', 'Review'];
    let backBtn = eleId('pos-back');
    if(pageTitlesToShowBackBtn.includes(document.title) && backBtn)
        backBtn.style.display = 'block';
}
function toolbarButtonSetup() {
    eleId('pos-back').addEventListener('click', goBack);
    eleId('pos-cancel-order').addEventListener('click', cancelBtnEvent);
}

function loadHTML(file) {
    return fetch(chrome.extension.getURL(file))
        .then(response => response.text());
}

loadHTML('/inject-toolbar.html')
    .then(data => {
        document.body.innerHTML += data;
        getCurrentState();
        toolbarButtonSetup();
        showBackBtn();
    }).catch(err => {
        console.error(err);
    });
