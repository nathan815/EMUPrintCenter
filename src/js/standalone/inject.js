const CART_URL = "/C20704_ustores/web/classic/shopping_cart.jsp";
const BEGIN_CHECKOUT_URL = 'https://ebill.emich.edu/C20704_ustores/web/classic/address_info.jsp';
const EMU_PRINT_URL = 'https://ebill.emich.edu/C20704_ustores/web/classic/print_order_receipt.jsp?INCLUDE_SCHEDULE=true';
let state = null;

function eleId(id) {
    return document.getElementById(id);
}

function fillCostInputAndContinue() {
    // Fill out total box and continue, if the input exists
    var costInput = eleId('ADD_ON_OFFER_USER_DEFINED_AMOUNT_49_49');
    if(costInput) {
        chrome.runtime.sendMessage({action: 'getCost',setState:'CHECKOUT'}, function(response) {
            console.log('cost',response.cost);
          costInput.value = response.cost;
          costInput.form.submit();
        });
    }
}

function continueToCheckout() {
    let cartContinueForm = eleId('delivery_method_navigation_form');
    if(cartContinueForm)
        cartContinueForm.submit();
    else if(document.title === 'IT Specialty Printing') 
        window.location = BEGIN_CHECKOUT_URL;
}

function getCurrentState() {
    chrome.runtime.sendMessage({action: 'currentState'}, function(response) {
        state = response.state;
        console.log('Current State = ',state);
        switch(response.state) {
            case 'DEFAULT':
            break;
            case 'BEGIN':
                eleId('loading-screen').style.display = 'block';
                fillCostInputAndContinue();
            break;
            case 'CHECKOUT':
                continueToCheckout();
                eleId('pos-checkout-toolbar').classList.add('checkout');
            break;
            case 'CANCEL':
            break;
            case 'COMPLETE':
                let w = window.open(EMU_PRINT_URL);
                w.print();
                w.close();
            break;
        }
    });
}

function goBack() {
    if( (1 < history.length) && document.referrer ) {
        history.back();
    }
}
function cancelBtnEvent() {
    chrome.runtime.sendMessage({action:'cancelPayment'}, function(response) {
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
        let ele = document.createElement('div');
        ele.innerHTML = data;
        document.body.appendChild(ele);
        getCurrentState();
        toolbarButtonSetup();
        showBackBtn();
    }).catch(err => {
        console.error(err);
    });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
     switch(request.action) {
        case 'closePaymentWindow':
            window.close();
        break;
     }
});
