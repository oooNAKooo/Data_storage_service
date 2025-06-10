export function exportItems(userId, username) {
    if (!userId || !username) {
        alert("Ошибка: не указаны данные пользователя.");
        return;
    }

    fetch(`http://127.0.0.1:5000/export/${userId}`, {
        method: "GET"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const filename = `${username}_экспорт.txt`;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error("Ошибка при экспорте:", error);
            alert("Не удалось выполнить экспорт.");
        });
}
