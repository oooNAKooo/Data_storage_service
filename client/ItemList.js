import React, { useState } from "react";

export const ItemList = ({ userId, items, deleteItem, editItem }) => {
    const [editingItem, setEditingItem] = useState(null);
    const [newName, setNewName] = useState("");
    const [newQuantity, setNewQuantity] = useState("");
    const [newNote, setNewNote] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [calculationItem, setCalculationItem] = useState(null);
    const [plusPerDay, setPlusPerDay] = useState("");
    const [minusPerDay, setMinusPerDay] = useState("");
    const [days, setDays] = useState("");
    const [resultModal, setResultModal] = useState(null);

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewName(item.name);
        setNewQuantity(item.quantity);
        setNewNote(item.note || "");
    };

    const handleSave = () => {
        if (editingItem) {
            editItem(editingItem.id, newName, newQuantity, newNote);
            setEditingItem(null);
            setNewName("");
            setNewQuantity("");
            setNewNote("");
        }
    };

    const handleCalcOpen = (item) => {
        setCalculationItem(item);
        setPlusPerDay("");
        setMinusPerDay("");
        setDays("");
        setResultModal(null);
    };

    const handleCalcSubmit = () => {
        if (!calculationItem) return;

        const currentQty = parseFloat(calculationItem.quantity);
        const added = parseFloat(plusPerDay);
        const subtracted = parseFloat(minusPerDay);
        const totalDays = parseInt(days);

        if (isNaN(currentQty) || isNaN(added) || isNaN(subtracted) || isNaN(totalDays)) {
            alert("Пожалуйста, введите все значения корректно.");
            return;
        }

        const futureQty = currentQty + (added - subtracted) * totalDays;

        // логирование на сервер
        fetch(`http://127.0.0.1:5000/items/${userId}/${calculationItem.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                itemName: calculationItem.name,
                initialQuantity: calculationItem.quantity,
                plusPerDay,
                minusPerDay,
                days,
                result: futureQty,
                timestamp: new Date().toISOString(),
            }),
        })
            .then((res) => res.json())
            .then((data) => console.log("Лог успешно отправлен:", data))
            .catch((err) => console.error("Ошибка логирования:", err));

        setCalculationItem(null);
        setResultModal({
            name: calculationItem.name,
            quantity: calculationItem.quantity,
            plusPerDay,
            minusPerDay,
            days,
            result: futureQty,
        });

    };


    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Поиск по названию элемента"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            <div style={styles.itemListContainer}>
                <ul style={styles.itemList}>
                    {filteredItems.length === 0 ? (
                        <p>Нет подходящих элементов.</p>
                    ) : (
                        filteredItems.map((item, index) => (
                            <li key={item.id} style={styles.itemRow}>
                                <div style={styles.index}>{index + 1}.</div>
                                <div style={styles.itemContent}>
                                    <span>
                                        {item.name} - {item.quantity} {item.note && `(${item.note})`}
                                    </span>
                                    <div style={styles.itemButtons}>
                                        <button onClick={() => handleCalcOpen(item)}>%</button>
                                        <button onClick={() => handleEdit(item)}>✏️</button>
                                        <button onClick={() => deleteItem(item.id)}>❌</button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {editingItem && (
                <div className="modal" style={styles.modal}>
                    <h3>Редактировать элемент</h3>
                    <input
                        type="text"
                        placeholder="Название"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="number"
                        placeholder="Количество"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Примечание"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        style={styles.input}
                    />
                    <div style={styles.buttonContainer}>
                        <button onClick={handleSave} style={styles.button}>Сохранить</button>
                        <button onClick={() => setEditingItem(null)} style={styles.button}>Отмена</button>
                    </div>
                </div>
            )}

            {calculationItem && (
                <div className="modal" style={styles.modal}>
                    <h3>Расчёт для: {calculationItem.name}</h3>
                    <input
                        type="number"
                        placeholder="+ в день"
                        value={plusPerDay}
                        onChange={(e) => setPlusPerDay(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="number"
                        placeholder="- в день"
                        value={minusPerDay}
                        onChange={(e) => setMinusPerDay(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="number"
                        placeholder="за ... дней"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        style={styles.input}
                    />
                    <div style={styles.buttonContainer}>
                        <button onClick={handleCalcSubmit} style={styles.button}>Рассчитать</button>
                        <button onClick={() => setCalculationItem(null)} style={styles.button}>Отмена</button>
                    </div>
                </div>
            )}

            {resultModal && (
                <div className="modal" style={styles.modal}>
                    <h3>Результат расчёта</h3>
                    <p>
                        Если каждый день прибавляется {plusPerDay}, убывает {minusPerDay}, и это длится {days} дней,
                        то элемент <strong>{resultModal.name}</strong> будет иметь количество:{" "}
                        <strong>{resultModal.result}</strong>
                    </p>
                    <div style={styles.buttonContainer}>
                        <button
                            onClick={() => {
                                const lines = [];
                                const start = parseFloat(resultModal.quantity);
                                const plus = parseFloat(resultModal.plusPerDay);
                                const minus = parseFloat(resultModal.minusPerDay);
                                const total = parseInt(resultModal.days);

                                let current = start;
                                lines.push(`Расчёт для элемента: ${resultModal.name}`);
                                lines.push(`Начальное количество: ${start}`);
                                lines.push(`+ в день: ${plus}`);
                                lines.push(`- в день: ${minus}`);
                                lines.push(`Дней: ${total}\n`);

                                for (let i = 1; i <= total; i++) {
                                    const delta = plus - minus;
                                    current += delta;
                                    lines.push(`День ${i}: ${current - delta} + (${plus} - ${minus}) = ${current}`);
                                }

                                lines.push(`\nИтоговое количество: ${current}`);

                                const fileContent = lines.join("\n");
                                const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${resultModal.name}_calculation.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            style={styles.button}
                        >
                            Запись
                        </button>
                        <button onClick={() => setResultModal(null)} style={styles.button}>Закрыть</button>
                    </div>

                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        paddingTop: "50px",
        textAlign: "center",
    },
    searchContainer: {
        marginBottom: "20px",
    },
    searchInput: {
        padding: "10px",
        width: "250px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    itemListContainer: {
        marginTop: "30px",
        padding: "10px",
        maxHeight: "400px",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
    },
    itemList: {
        listStyleType: "none",
        padding: "0",
    },
    itemRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: "10px",
        borderBottom: "1px solid #eee",
        paddingBottom: "5px",
    },
    index: {
        width: "30px",
        textAlign: "right",
        marginRight: "10px",
        fontWeight: "bold",
    },
    itemContent: {
        flex: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemButtons: {
        display: "flex",
        gap: "5px",
    },
    input: {
        padding: "10px",
        width: "250px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        marginBottom: "10px",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "10px",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "5px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        cursor: "pointer",
        marginTop: "10px",
    },
    modal: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        zIndex: 999,
    },
};

export default ItemList;
