$('#checkoutForm').submit((e) => {
    e.preventDefault();
    $.ajax({
        url: '/placeOrder',
        method: 'post',
        data: $('#checkoutForm').serialize(),
        success: (response) => {
            if (response.codSuccess){
                location.href = '/orderConfirmationPage';
            } else {
                razorPayment(response);
            }
        }
    })
})

function razorPayment(order) {
    let options = {
        'key': 'rzp_test_eXHeIXDXI5A5em',
        'amount': order.amount,
        'currency': 'INR',
        'name': 'PHONEMART',
        'description': 'PHONEMART cash transaction',
        'order_id': order.id,
        'handler': (response) => {
            verifyPayment(response, order)
        },
        'prefill': {
            'name': 'user',
            'contact': '9999999999',
            'email': 'user@gmail.com'
        },
        'notes': {
            'address': 'Razorpay Corporate Office'
        },
        'theme': {
            'color': '#FFD333'
        }
    }
    let rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment, order) {
    $.ajax({
        url: '/verifyPayment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = '/orderConfirmationPage';
            } else {
                alert('Payment failed');
            }
        }
    })
}