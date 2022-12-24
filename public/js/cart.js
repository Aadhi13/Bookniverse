function changeQuantity(proId, count) {
    $.ajax({
        url: '/changeQuantity',
        data: {
            productId: proId,
            count: count
        },
        method: 'post',
        success: (response) => {
            let price = response.srp;
            let productCount = response.quantity;
            $('#productTotal' + proId).html('Total Price: '+productCount * price);
            
            if(productCount > 1) {
                var miniQuantityText = ' Items';
            } else {
                var miniQuantityText = ' Item';
            }
            $('#miniQuantity' + proId).html('('+productCount+ miniQuantityText+')');
            
            let current_subTotal = $('#subtotal').html().replace(/^\D+/g, '');
            current_subTotal = parseInt(current_subTotal);
            $('#subtotal').html('Rs. '+(current_subTotal + (count * price)))

            let shipping_Cost = 0;
            if (current_subTotal < 500) {
                $('#shippingcost').html('Rs. 50');
                shipping_Cost = 50;
            } else {
                $('#shippingcost').html('Rs. 0');
                shipping_Cost = 0;
            }

            let currentTotal = $('#subtotal').html().replace(/^\D+/g, '');
            currentTotal = parseInt(currentTotal);
            $('#total').html('Rs. '+(currentTotal + shipping_Cost));
        }
    })
}

function removeFromCart(productId) {
    $.ajax({
        url: '/removeFromCart',
        data: {
            productId: productId
        },
        method: 'post',
        success: (response) => {
            location.reload();
        },
        error: () => {
            alert('Error occured');
        }
    })
}

let count = 0;

$('#couponForm').submit((e) => {
    e.preventDefault();
    $.ajax({
        url: '/applyCoupon',
        method: 'post',
        data: $('#couponForm').serialize(),
        success: (result) => {
            if (result) {
                if (count == 0) {
                    count = 1;
                    let shipping_Cost = 0;
                    let currentSubTotal = parseInt($('#subtotal').html().replace(/^\D+/g, ''));
                    console.log(currentSubTotal);
                    if (currentSubTotal < 500) {
                        $('#shippingcost').html('Rs. 50');
                        shipping_Cost = 50;
                    } else {
                        $('#shippingcost').html('Rs. 0');
                        shipping_Cost = 0;
                    }

                    $('#invalidCoupon').addClass('d-none');
                    $('#couponApplied').removeClass('d-none');
                    let discount = result.discountPercentage;
                    let subTotal = $('#subtotal').html().replace(/^\D+/g, '');
                    let discountPrice = Math.round(subTotal * discount / 100);
                    subTotal = subTotal - discountPrice;
                    $('#discount').removeClass('d-none');
                    $('#discountPrice').removeClass('d-none');
                    $('#discountPrice').html('Rs.' + discountPrice);
                    $('#couponDiscount').html('Rs. ' + (discountPrice));
                    $('#total').html('Rs. ' + (subTotal + shipping_Cost));
                }
            } else {
                $('#invalidCoupon').removeClass('d-none');
                $('#couponApplied').addClass('d-none');
            }
        }
    })
})

function proceedtoCheckout() {
    let total = document.getElementById('total').innerHTML;
    let couponCode = document.getElementById('coupenCode').value;

    $.ajax({
        url: '/proceedtoCheckout',
        method: 'post',
        data: {
            total: total,
            couponCode: couponCode
        },
        success: (response) => {
            location.href = '/checkout'
        }
    })
}