let variantIndex = 0;

function addVariantImageInputListeners() {
    for (let i = 0 ; i <= variantIndex ; i++) {
        const variantImageInput = document.querySelector('#variant-image-' + i);
        const variantImageLabel = document.querySelector('#variant-image-label-' + i);
        const variantImagePreviewContainer = document.querySelector('#variant-image-preview-container-' + i);

        if (variantImageInput && variantImageLabel) {
            variantImageInput.addEventListener('change', (event) => {
                const files = Array.from(event.target.files);
                if (files.length > 0) {
                    variantImageLabel.textContent = files.map(file => file.name).join(', ');
                } else {
                    variantImageLabel.textContent = 'Choose file...';
                }

                variantImagePreviewContainer.innerHTML = '';
                files.forEach(file => {
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const col = document.createElement("div");
                            col.classList.add("col-6", "col-md-4", "col-lg-3", "mb-3");

                            const img = document.createElement("img");
                            img.src = e.target.result;
                            img.classList.add("img-fluid", "rounded");
                            img.style.maxHeight = "150px";

                            col.appendChild(img);
                            variantImagePreviewContainer.appendChild(col);
                        };
                        reader.readAsDataURL(file);
                    }
                })
            })
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const productImageInput = document.querySelector('#product-images');
    const productImageLabel = document.querySelector('#product-images-label');
    const previewContainer = document.querySelector('#product-image-preview-container');

    productImageInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            productImageLabel.textContent = `${files.length} file(s) selected`;
        } else {
            productImageLabel.textContent = 'Choose files...';
        }

        previewContainer.innerHTML = "";
        files.forEach(file => {
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const col = document.createElement("div");
                    col.classList.add("col-6", "col-md-4", "col-lg-3", "mb-3");

                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.classList.add("img-fluid", "rounded");
                    img.style.maxHeight = "150px";

                    col.appendChild(img);
                    previewContainer.appendChild(col);
                };
                reader.readAsDataURL(file);
            }
        })
    });

    addVariantImageInputListeners();

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
                    <div class="invalid-feedback invalid-variant-sku" style="text-align: center">Please fill in at least one of the three fields above.</div>
                </div>
                <div class="form-row mt-2">
                    <div class="col">
                        <label for="variant-stock">Quantity</label>
                        <input type="number" class="form-control" name="variants[${variantIndex}].stock"
                               placeholder="Enter Quantity">
                    </div>
                    <div class="invalid-feedback">Please enter a valid quantity</div>
                    <div class="col">
                        <label for="variant-cost-price">Cost Price</label>
                        <input type="number" class="form-control" name="variants[${variantIndex}].costPrice"
                               placeholder="Enter Cost Price">
                        <div class="invalid-feedback">Please enter a valid cost price</div>       
                    </div>
                </div>
                <div class="form-row mt-2">
                    <div class="col">
                        <label for="variant-price">Price</label>
                        <input type="number" class="form-control" name="variants[${variantIndex}].price"
                               placeholder="Enter Price">
                        <div class="invalid-feedback">Please enter a valid cost price</div>
                    </div>
                    <div class="col">
                        <label for="variant-sale-price">Sale Price</label>
                        <input type="number" class="form-control" name="variants[${variantIndex}].salePrice"
                               placeholder="Enter Sale Price">
                        <div class="invalid-feedback">Please enter a valid sale price</div>
                    </div>
                </div>
                <div class="form-row mt-2">
                    <p>Variant Image:</p>
                    <div class="custom-file">
                        <input type="file" id="variant-image-${variantIndex}" class="custom-file-input" name="variants[${variantIndex}].image">
                        <label id="variant-image-label-${variantIndex}" class="custom-file-label" for="variantImage">Choose file...</label>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col-12">
                        <div id="variant-image-preview-container-${variantIndex}" class="image-preview-container row mt-3">
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col-auto">
                        <button type="button" class="btn btn-danger remove-variant mt-4" button-delete-variant>Remove</button>
                    </div>
                </div>
            </div>`;

        variantsContainer.insertAdjacentHTML('beforeend', variantItem);

        addVariantImageInputListeners();
    });

    const tagsInput = document.querySelector('#tags');
    const tagify = new Tagify(tagsInput, {
        whitelist: ["Minimal", "T-Shirts", "Jeans", "Winter", "New", "Sale"],
        dropdown: {
            maxItems: 5,
            enabled: 0
        }
    });

    const validateField = (element, condition) => {
        if (condition) {
            element.classList.add('is-invalid');
            return false;
        } else {
            element.classList.remove('is-invalid');
            return true;
        }
    };

    const createProductForm = document.getElementById('create-product-form');

    const category = document.getElementById('category');
    const subcategory = document.getElementById('subcategory');
    const imagesSelect = document.getElementById('product-images');

    createProductForm.addEventListener('submit', (event) => {
        let isValid = true;

        isValid &= validateField(category, !category.value || category.value === 'no');

        isValid &= validateField(subcategory, !subcategory.value || subcategory.value === 'no');

        isValid &= validateField(imagesSelect, !imagesSelect.files.length);

        document.querySelectorAll('.variant-item').forEach(variantItem => {
            const invalidVariantSku = variantItem.querySelector('.invalid-variant-sku');
            const name = variantItem.querySelector('input[name*="name"]');
            const color = variantItem.querySelector('input[name*="color"]');
            const size = variantItem.querySelector('input[name*="size"]');
            const stock = variantItem.querySelector('input[name*="stock"]');
            const costPrice = variantItem.querySelector('input[name*="costPrice"]');
            const price = variantItem.querySelector('input[name*="price"]');
            const salePrice = variantItem.querySelector('input[name*="salePrice"]');

            const variantFieldsEmpty = !name.value && !color.value && !size.value;
            isValid &= validateField(name, variantFieldsEmpty);
            isValid &= validateField(color, variantFieldsEmpty);
            isValid &= validateField(size, variantFieldsEmpty);

            if (variantFieldsEmpty) {
                invalidVariantSku.style.display = 'block';
            } else {
                invalidVariantSku.style.display = 'none';
            }

            isValid &= validateField(stock, stock.value == null || stock.value === '' || Number(stock.value) < 0);
            isValid &= validateField(costPrice, costPrice.value == null || costPrice.value === '' || Number(costPrice.value) < 0);
            isValid &= validateField(price, price.value == null || price.value === '' || Number(price.value) < 0);
            isValid &= validateField(salePrice, Number(salePrice.value) < 0);
        });

        if (!isValid) {
            event.preventDefault();
        }
    })
});
