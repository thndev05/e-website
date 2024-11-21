const cartItemCount = document.querySelector('.cart-count');
const minicart = document.querySelector('.minicart');

refreshCart()

function refreshCart() {
    const cart = fetch("/cart/detail")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load cart. " + response.statusText);
            }
            return response.json();
        })
        .then((cart) => {
            console.log(cart);
            displayCart(cart);
        })

}

function displayCart(cart) {
    cartItemCount.textContent = cart.products.length.toString();

    // Reset minicart
    minicart.innerHTML = '';

    for (const p of cart.products) {
        const product = p.product;

        const listItem = document.createElement('li');

        listItem.innerHTML = `
            <div class="cart-img">
                <a href="product-details.html">
                    <img src="${product.images[0]}" alt="" />
                </a>
            </div>
            <div class="cart-content">
                <h3>
                    <a href="product-details.html">${product.name}</a>
                </h3>
                <div class="cart-price">
                    <span class="new">${p.variant.salePrice}</span>
                    <span>
                        <del>${p.variant.price}</del>
                    </span>
                </div>
            </div>
            <div class="del-icon">
                <a href="#">
                    <i class="far fa-trash-alt"></i>
                </a>
            </div>
        `;

        minicart.appendChild(listItem);
    }
}