function addToWishlist(productId){
    fetch('/addToWishlist',{
        method:'post',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({ productId })
    }).then((response) => {
        response.json();
        window.location.reload();
    }).catch((error) => {
        console.log('Error: ',error.message);
    })
}