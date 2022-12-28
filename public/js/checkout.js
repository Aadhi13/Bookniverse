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
                console.log(response);
                razorPayment(response);
            }
        }
    })
})

function razorPayment(order) {
    console.log(order);
    let options = {
        'key': 'rzp_test_byX4xjQdkJOyzX',
        'amount': order.amount,
        'currency': 'INR',
        'name': 'BOOKNIVERSE',
        'description': 'BOOKNIVERSE cash transaction',
        'order_id': order.id,
        'handler': (response) => {
            verifyPayment(response,order)
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
            'color': '#ba6a62'
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