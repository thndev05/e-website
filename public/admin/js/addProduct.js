let variantIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const productImageInput = document.querySelector('#product-images');
    const productImageLabel = document.querySelector('.custom-file-label');

    productImageInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            productImageLabel.textContent = files.map(file => file.name).join(', ');
        } else {
            productImageLabel.textContent = 'Choose files...';
        }
    });

    const variantsContainer = document.querySelector('#variants-container');
    const addVariantButton = document.querySelector('#add-variant-btn');

    variantsContainer.addEventListener('click', (e) => {
        if (e.target && e.target.matches('[button-delete-variant]')) {
            e.preventDefault();
            const variantItem = e.target.closest('.variant-item');
            if (variantItem) {
                variantItem.remove();
            }
        }
    });


    addVariantButton.addEventListener('click', (e) => {
        e.preventDefault();

        variantIndex++;

        const variantItem = `
            <div class="align-items-end variant-item mb-3 border p-3">
                <div class="form-row">
                    <div class="col">
                        <label for="variantName">Variant Name</label>
                        <input type="text" class="form-control" name="variants[${variantIndex}].name" placeholder="Enter Product Variant Name">
                    </div>
                    <div class="col">
                        <label for="variantColor">Color</label>
                        <input type="text" class="form-control" name="variants[${variantIndex}].color" placeholder="Enter Color">
                    </div>
                    <div class="col">
                        <label for="variantSize">Size</label>
                        <input type="text" class="form-control" name="variants[${variantIndex}].size" placeholder="Enter Size">
                    </div>
                </div>
                <div class="form-row mt-2">
                    <div class="col">
                        <label for="variantPrice">Price</label>
                        <input type="number" class="form-control" name="variants[${variantIndex}].price" placeholder="Enter Price">
                    </div>
                    <div class="col">
                        <label for="variantStock">Quantity</label>
                        <input type="number" class="form-control" name="variants[${variantIndex}].stock" placeholder="Enter Quantity">
                    </div>
                </div>
                <div class="form-row mt-2">
                    <p>Variant Image:</p>
                    <div class="custom-file">
                        <input type="file" class="custom-file-input" name="variants[${variantIndex}].image" required>
                        <label class="custom-file-label" for="variantImage">Choose file...</label>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col-auto">
                        <button type="button" class="btn btn-danger remove-variant mt-4" button-delete-variant>Remove</button>
                    </div>
                </div>
            </div>`;

        variantsContainer.insertAdjacentHTML('beforeend', variantItem);
    });
});
