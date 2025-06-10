import React, { useState, useEffect } from "react";
import AuthForm from "AuthForm";
import AdminPanel from "AdminPanel";
import ItemsList from "ItemList";
import ItemForm from "ItemEditor";
import { exportItems } from "Export";
import { exportExcel } from "ExportExcel";
import { importExcel } from "ImportExcel";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (isLoggedIn && userId) {
            fetch(`http://127.0.0.1:5000/items/${userId}`)
                .then((response) => response.json())
                .then((data) => setItems(data));
        }
    }, [isLoggedIn, userId]);
    const handleAuth = () => {
        if (username === "админ" && password === "1234") {
            setIsAdmin(true);
            setIsLoggedIn(true);
            return;
        }

        const url = isRegistering
            ? "http://127.0.0.1:5000/register"
            : "http://127.0.0.1:5000/login";

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    alert(data.message);
                    if (isRegistering) {
                        setIsRegistering(false);
                        setPassword("");
                    } else {
                        setIsLoggedIn(true);
                        if (data.user_id) setUserId(data.user_id);
                    }
                } else {
                    alert(data.error || "Ошибка авторизации.");
                }
            });
    };
    const deleteItem = (itemId) => {
        fetch(`http://127.0.0.1:5000/items/${userId}/${itemId}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "Элемент удален") {
                    setItems(items.filter((item) => item.id !== itemId));
                } else {
                    alert("Ошибка при удалении элемента.");
                }
            });
    };
    const editItem = (itemId, newName, newQuantity, newNote) => {
        fetch(`http://127.0.0.1:5000/items/${userId}/${itemId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newName,
                quantity: newQuantity,
                note: newNote,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "Элемент обновлен") {
                    setItems(
                        items.map((item) =>
                            item.id === itemId
                                ? { ...item, name: newName, quantity: newQuantity, note: newNote }
                                : item
                        )
                    );
                } else {
                    alert("Ошибка при обновлении элемента.");
                }
            });
    };
    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserId(null);
        setUsername("");
        setPassword("");
    };
    if (!isLoggedIn) {
        return (
            <AuthForm
                isRegistering={isRegistering}
                setIsRegistering={setIsRegistering}
                handleAuth={handleAuth}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
            />
        );
    }
    if (isAdmin) {
        return <AdminPanel handleLogout={handleLogout} />;
    }
    return (
        <div>
            <h1>Склад ({username})</h1>
            <ItemsList items={items} deleteItem={deleteItem} editItem={editItem} />
            <ItemForm userId={userId} setItems={setItems} />
            <button onClick={() => exportExcel(userId, username)}>Экспорт в Excel</button>
            <button onClick={() => exportItems(userId, username)}>Экспорт</button>
            <button onClick={() => importExcel(userId)}>Импорт</button>
            <button onClick={handleLogout}>Выйти</button>
        </div>
    );
}

export default App;
