export function importExcel(userId) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx";

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        fetch(`http://127.0.0.1:5000/import_excel/${userId}`, {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Ошибка: ${data.error}`);
                } else {
                    alert(data.message || "Импорт выполнен.");
                }
            })
            .catch(err => {
                console.error("Ошибка импорта:", err);
                alert("Не удалось выполнить импорт. Пожалуйста, попробуйте снова.");
            });
    };

    input.click();
}
