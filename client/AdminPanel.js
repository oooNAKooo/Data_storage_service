import React, { useState, useEffect } from "react";

function AdminPanel({ handleLogout }) {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch("http://127.0.0.1:5000/admin/users")
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => {
                console.error("Ошибка при загрузке пользователей:", error);
            });
    }, []);

    const deleteUser = (userId) => {
        fetch(`http://127.0.0.1:5000/admin/users/${userId}`, {
            method: "DELETE",
        }).then(() => {
            setUsers(users.filter((user) => user.id !== userId));
        });
    };

    const updatePassword = () => {
        fetch(`http://127.0.0.1:5000/admin/users/${editingUser.id}/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword }),
        }).then(() => {
            alert("Пароль успешно обновлен");
            setEditingUser(null);
            setNewPassword("");
        });
    };

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Админ-панель</h1>
            </div>
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Поиск по имени пользователя"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>
            <div style={styles.userListContainer}>
                <ul style={styles.userList}>
                    {filteredUsers.length === 0 ? (
                        <p>Нет подходящих пользователей.</p>
                    ) : (
                        filteredUsers.map((user) => (
                            <li key={user.id} style={styles.userListItem}>
                                <span>{user.username}</span>
                                <div style={styles.buttonGroup}>
                                    <button onClick={() => setEditingUser(user)} style={styles.iconButton}>✏️</button>
                                    <button onClick={() => deleteUser(user.id)} style={styles.iconButton}>❌</button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
            <div style={styles.logoutContainer}>
                <button onClick={handleLogout} style={styles.logoutButton}>Выйти</button>
            </div>
            {editingUser && (
                <div className="modal" style={styles.modal}>
                    <h3>Новый пароль для {editingUser.username}</h3>
                    <input
                        type="password"
                        placeholder="Новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={styles.input}
                    />
                    <div style={styles.modalButtons}>
                        <button onClick={updatePassword} style={styles.button}>Обновить</button>
                        <button onClick={() => setEditingUser(null)} style={styles.button}>Отмена</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        paddingTop: "50px",
        textAlign: "center",
    },
    header: {
        marginBottom: "20px",
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
    userListContainer: {
        marginTop: "30px",
        padding: "10px",
        maxHeight: "400px",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
    },
    userList: {
        listStyleType: "none",
        padding: "0",
        margin: "0",
    },
    userListItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 10px",
        borderBottom: "1px solid #eee",
    },
    buttonGroup: {
        display: "flex",
        gap: "8px",
    },
    iconButton: {
        backgroundColor: "#f0f0f0",
        border: "none",
        borderRadius: "4px",
        padding: "5px 10px",
        cursor: "pointer",
        fontSize: "16px",
    },
    logoutContainer: {
        marginTop: "30px",
    },
    logoutButton: {
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "5px",
        backgroundColor: "#ff4d4d",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    modal: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
    },
    input: {
        padding: "10px",
        width: "100%",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        marginBottom: "10px",
    },
    modalButtons: {
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
    },
};

export default AdminPanel;
