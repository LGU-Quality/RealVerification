let tableData = [];

// CSV 파일을 읽어와서 표로 표현하는 함수
function displayCSVAsTable(data) {
    tableData = data; // 테이블 데이터를 저장

    const tableContainer = document.getElementById("table-container");
    tableContainer.innerHTML = ''; // 기존 테이블 내용 초기화

    const table = document.createElement("table");

    // 헤더 생성
    const headerRow = document.createElement("tr");
    data[0].forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // 데이터 생성
    for (let i = 1; i < data.length; i++) {
        const row = document.createElement("tr");
        data[i].forEach((cell, columnIndex) => {
            const td = document.createElement("td");
            td.textContent = cell;
            
            // '실사결과' 칼럼이고 값이 '완료'인 경우 해당 칼럼을 회색으로 음영 처리
            if (data[0][columnIndex] === '실사결과' && cell === '완료') {
                td.style.backgroundColor = '#f2f2f2';
            }

            row.appendChild(td);
        });
        table.appendChild(row);
    }

    tableContainer.appendChild(table);
}

// 테이블 검색 함수
function searchTable() {
    const searchInput = document.getElementById("searchInput");
    const filter = searchInput.value.toUpperCase();
    const table = document.querySelector("table");
    const rows = table.getElementsByTagName("tr");

    // 각 행을 순회하며 검색어와 일치하는 행만 보이도록 설정
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let rowMatch = false;

        for (let j = 0; j < cells.length; j++) {
            const cellValue = cells[j].textContent || cells[j].innerText;
            if (cellValue.toUpperCase().indexOf(filter) > -1) {
                rowMatch = true;
                break;
            }
        }

        rows[i].style.display = rowMatch ? "" : "none";
    }
}

// CSV 파일 읽기 및 표로 표현하기
Papa.parse("test.csv", {
    download: true,
    complete: function (results) {
        displayCSVAsTable(results.data);
    }
});
