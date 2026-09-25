import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

function App() {

    const [groceryList, setGroceryList] = useState([]);

    // Renders the grocery list on initial visit
    useEffect(() => {
        fetch('/items')
            .then(response => response.json())
            .then(data => {
                console.log("GROCERY DATA:", data);
                setGroceryList(data);
            });
    }, []);

    // Updating the purchased status of a grocery item
    const handleUpdate = async (id, is_purchased) => {
        const response = await fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                is_purchased: is_purchased
            })
        });

        const data = await response.json();
        setGroceryList(data);
    };

    // Deleting a grocery item
    const handleDelete = async (id) => {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        });

        const data = await response.json();
        setGroceryList(data);
    };

    // Submitting the add item form
    const handleSubmit = async (event) => {
        event.preventDefault();

        const item = event.target.item.value;
        const quantity = event.target.quantity.value;
        const is_purchased = event.target.is_purchased.checked;

        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                item: item,
                quantity: quantity,
                is_purchased: is_purchased
            })
        });

        const data = await response.json();
        setGroceryList(data);
    };

    // Defines what a grocery item should look like
    function GroceryItem({ item, onUpdate, onDelete }) {
        return (
            <li className="grocery-item">

                {/*CHECKBOX*/}
                <input
                    type="checkbox"
                    checked={item.is_purchased}
                    onChange={(event) => onUpdate(item.id, event.target.checked)} // send the post request with the item id and with its check status
                />

                {/* ITEM QUANTITY + NAME*/}
                {item.description}

                {/* DELETE BUTTON */}
                <button
                    onClick={() => onDelete(item.id)}
                    aria-label="Delete grocery item"
                >
                    <i className="bi bi-trash"></i>
                </button>
            </li>
        );
    }

    return (
        <>
            <header>
                <h1>My Grocery List</h1>

                <a href="/logout" className="btn btn-secondary logout-button">
                    Log out
                </a>
            </header>

            <div id="add-item-form-container">
                <div className="add-item-form">
                    <h2>Add Grocery Item</h2>

                    <form
                        className="fjalla-one-regular"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-field">
                            <label htmlFor="item">Item</label>
                            <input
                                type="text"
                                id="item"
                                className="form-control"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="quantity">Quantity</label>
                            <input
                                type="text"
                                id="quantity"
                                className="form-control"
                            />
                        </div>

                        <div className="form-field purchased-field">
                            <label htmlFor="is_purchased">
                                Purchased?
                            </label>

                            <input
                                type="checkbox"
                                id="is_purchased"
                                className="form-check-input"
                                aria-label="Mark grocery item as purchased"
                            />
                        </div>

                        <button
                            className="submit-button btn btn-primary"
                            aria-label="Add grocery item"
                        >
                            <i className="bi bi-plus-lg"></i>
                        </button>

                    </form>
                </div>
            </div>

            <div id="shopping-lists-container">

                <div
                    id="shopping-list-to-buy"
                    className="shopping-list-container to-buy"
                >
                    <h2 className="list-heading">To Buy</h2>

                    <ul
                        id="shopping-list-to-buy-items"
                        className="handwriting"
                    >
                        {groceryList
                            .filter(item => !item.is_purchased)
                            .map(item => (
                                <GroceryItem
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                    </ul>
                </div>

                <div
                    id="shopping-list-purchased"
                    className="shopping-list-container"
                >
                    <h2 className="list-heading">Purchased</h2>

                    <ul
                        id="shopping-list-purchased-items"
                        className="handwriting"
                    >
                        {groceryList
                            .filter(item => item.is_purchased)
                            .map(item => (
                                <GroceryItem
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                />
                            ))}
                    </ul>
                </div>

            </div>
        </>
    );
}

createRoot(document.getElementById("root")).render(
    <App />
);