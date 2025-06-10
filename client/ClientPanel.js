import React, { useState, useEffect } from "react";
import { importExcel } from "./ImportExcel";

export function ClientPanel({ onLogout }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/data")
            .then((response) => response.json())
            .then((data) => setData(data));
    }, []);

    const addData = (newData) => {
        fetch("http://127.0.0.1:5000/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newData),
        })
            .then((response) => response.json())
            .then((addedData) => setData([...data, addedData]));
    };

    return (
        <div>
            <h1>Панель пользователя</h1>
            <table>
                <thead>
                <tr>
                    <th>Данные</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={onLogout}>Выйти</button>
            <button onClick={() => addData({ name: "Новый элемент" })}>Добавить данные</button>
            <importExcel onImport={(importedItems) => {
                importedItems.forEach((item) => addData(item));
            }} />
        </div>
    );
}
