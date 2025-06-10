import React from "react";


function AuthForm({ isRegistering, setIsRegistering, handleAuth, username, setUsername, password, setPassword }) {
    return (
        <div className="app-container">
            <h2>{isRegistering ? "Регистрация" : "Вход"}</h2>
            <input placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
            {isRegistering && <input type="password" placeholder="Подтвердите пароль" />}
            <button onClick={handleAuth}>{isRegistering ? "Зарегистрироваться" : "Войти"}</button>
            <p onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
            </p>
        </div>
    );
}

export default AuthForm;
