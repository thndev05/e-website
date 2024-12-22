const cartItemCount = document.querySelector('.cart-count');
const minicart = document.querySelector('.minicart');

refreshCart()

function refreshCart() {
    fetch("/cart/detail")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load cart. " + response.statusText);
            }
            return response.json();
        })
        .then((cart) => {
            console.log(cart);
            renderMiniCart(cart);
        })

}

function renderMiniCart(cart) {
    cartItemCount.textContent = cart.products.length.toString();

    minicart.innerHTML = '';

    let total = 0;

    for (const p of cart.products) {
        const product = p.product;

        total += p.quantity * (p.variant.salePrice ? p.variant.salePrice : p.variant.price);

        const listItem = document.createElement('li');

        const price = currencyUSD(p.variant.salePrice ? p.variant.salePrice : p.variant.price);

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
                    <span class="new">${price}</span>
                </div>
            </div>
        `;

        const delIcon = document.createElement('div');
        delIcon.classList.add('del-icon');

        const delIconLink = document.createElement('a');
        delIconLink.innerHTML = '<i class="far fa-trash-alt"></i>';

        delIcon.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            const data = {};
            data.productId = product._id;
            data.variantSKU = p.variantSKU;

            fetch('/cart/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            }).then(() => {
                refreshCart();
            }).catch(error => {
                console.log('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error has occurred, please try again!',
                    showConfirmButton: false,
                    timer: 1500
                });
            });
        });

        delIcon.appendChild(delIconLink);
        listItem.appendChild(delIcon);

        minicart.appendChild(listItem);
    }

    const totalPriceItem = document.createElement('li');

    const formattedTotal = currencyUSD(total);
    totalPriceItem.innerHTML = `
        <div class="total-price">
            <span class="f-left">Total:</span>
            <span class="f-right">${formattedTotal}</span>
        </div>
    `;
    minicart.appendChild(totalPriceItem);

    const checkoutItem = document.createElement('li');
    checkoutItem.innerHTML = `
        <div class="checkout-link">
            <a href="/cart">Shopping Cart</a>
            <a id="checkout-link" class="red-color" href="/checkout">Checkout</a>
        </div>
    `;
    minicart.appendChild(checkoutItem);

    const checkoutLink = document.getElementById('checkout-link');
    checkoutLink.addEventListener('click', (event) => {
        if (!Array.isArray(cart.products) || cart.products.length === 0) {
            event.preventDefault();

            Swal.fire({
                icon: 'warning',
                title: 'Your cart is empty',
                text: 'Please add some items to your cart.',
                confirmButtonText: 'OK'
            });
        }
    })
}

function getVariantText(variant) {
    return [variant.name, variant.color, variant.size]
        .filter(Boolean)
        .join(" ")
        .trim();
}

function currencyUSD(value) {
    if (typeof value !== 'number') {
        value = parseFloat(value) || 0;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}