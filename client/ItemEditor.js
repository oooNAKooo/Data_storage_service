import React, { useState } from "react";

function ItemForm({ userId, setItems, items = [] }) {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("");

    const addItem = () => {
        if (!userId) return;

        fetch(`http://127.0.0.1:5000/items/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, quantity, note }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.item_id) {
                    setItems((prevItems) => [...prevItems, { id: data.item_id, name, quantity, note }]);
                    setName("");
                    setQuantity("");
                    setNote("");
                } else {
                    alert("Ошибка при добавлении элемента.");
                }
            });
    };

    return (
        <div style={{ paddingTop: "50px" }}>
            <div style={styles.form}>
                <input
                    placeholder="Название"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                />
                <input
                    placeholder="Количество"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={styles.input}
                />
                <input
                    placeholder="Примечание"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={styles.input}
                />
                <button onClick={addItem} style={styles.button}>Добавить</button>
            </div>
        </div>
    );
}

const styles = {
    header: {
        textAlign: "center",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px",
    },
    input: {
        padding: "10px",
        width: "250px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "5px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
};

export default ItemForm;
