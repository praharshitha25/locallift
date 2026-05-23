import React from "react";

function AddProduct() {
    return (
        <section>
            <h1>Add Product</h1>
            <form>
                <label>
                    Product Name
                    <input type="text" name="name" />
                </label>
                <label>
                    Price
                    <input type="number" name="price" />
                </label>
                <button type="submit">Add</button>
            </form>
        </section>
    );
}

export default AddProduct;
