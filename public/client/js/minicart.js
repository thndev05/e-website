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

    let total = 0;

    for (const p of cart.products) {
        const product = p.product;

        total += p.quantity * (p.variant.salePrice ? p.variant.salePrice : p.variant.price);

        const listItem = document.createElement('li');

        listItem.innerHTML = `
            <div class="cart-img">
                <a href="product-details.html">
                    <img src="${product.images[0]}" alt="" />
                </a>
            </div>
            <div class="cart-content">
                <h3>
                    <a href="/product/${product.slug}">${product.name}</a>
                </h3>
                <div>
                    <h4>${getVariantText(p.variant)}</h4>
                </div>
                <div class="cart-price">
                    <span class="quantity">${p.quantity} x </span>
                    <span class="new">$${p.variant.salePrice ? p.variant.salePrice : p.variant.price}</span>
                 
                </div>
            </div>
            <div class="del-icon">
                <a href="#">
                    <i class="far fa-trash-alt"></i>
                </a>
            </div>
        `;

        minicart.appendChild(listItem);

        minicart.innerHTML = minicart.innerHTML + `
            <li>
                <div class="total-price">
                    <span class="f-left">Total:</span>
                    <span class="f-right">$${total}</span>
                </div>
            </li>
            <li>
                <div class="checkout-link">
                    <a href="cart.html">Shopping Cart</a>
                    <a class="red-color" href="checkout.html">Checkout</a>
                </div>
            </li>`
    }
}

function getVariantText(variant) {
    return [variant.name, variant.color, variant.size]
        .filter(Boolean)
        .join(" ")
        .trim();
}
