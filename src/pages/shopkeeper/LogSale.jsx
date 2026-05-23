import React from "react";

function LogSale() {
    return (
        <section>
            <h1>Log Sale</h1>
            <form>
                <label>
                    Product
                    <input type="text" name="product" />
                </label>
                <label>
                    Quantity
                    <input type="number" name="quantity" />
                </label>
                <button type="submit">Record Sale</button>
            </form>
        </section>
    );
}

export default LogSale;
