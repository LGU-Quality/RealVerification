// 웹 워커 생성
const worker = new Worker('worker.js');

let headers; // 헤더 정보를 전역 변수로 저장
let tableData; // 테이블 데이터를 전역 변수로 저장
let sortColumn = null; // 정렬할 칼럼
let isAscending = true; // 오름차순 정렬 여부

// CSV 파일을 읽어와서 표로 표현하는 함수
function displayCSVAsTable(data) {
    if (data.length === 0) {
        console.error('CSV 데이터가 비어있습니다.');
        return;
    }

    headers = data[0];
    tableData = data.slice(1); // 헤더를 제외한 데이터

    // 검색어와 테이블 데이터를 웹 워커에 전달
    document.getElementById("searchInput").addEventListener("input", (event) => {
        const searchInput = event.target.value;
        worker.postMessage({ headers, tableData, searchInput });
    });

    // 웹 워커로부터 검색 결과를 받아서 표시
    worker.onmessage = (event) => {
        const filteredData = event.data;
        renderTable(filteredData);
    };

    // 헤더를 클릭할 때 정렬 기능 추가
    document.getElementById("table-container").addEventListener("click", (event) => {
        if (event.target.tagName === "TH") {
            const clickedColumn = event.target.textContent.trim();
            if (sortColumn === clickedColumn) {
                isAscending = !isAscending; // 같은 칼럼을 클릭하면 정렬 방향을 반대로 변경
            } else {
                sortColumn = clickedColumn;
                isAscending = true; // 새로운 칼럼을 클릭하면 기본적으로 오름차순 정렬
            }

            sortTableData();
        }
    });

    // 최초 테이블 표시
    renderTable(tableData);
}

// 테이블 표시 함수
function renderTable(data) {
    const tableContainer = document.getElementById("table-container");
    tableContainer.innerHTML = ''; // 기존 테이블 내용 초기화

    const table = document.createElement("table");

    // 헤더 생성
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // 데이터 생성
    data.forEach((row) => {
        const tr = document.createElement("tr");

        row.forEach((cell, index) => {
            const td = document.createElement("td");
            td.textContent = cell;

            // '실사결과' 칼럼이 '완료'인 경우 행을 회색으로 음영처리
            if (headers[index] === '실사결과' && cell.trim().toLowerCase() === '완료') {
                tr.style.backgroundColor = 'lightgray';
            }

            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    tableContainer.appendChild(table);
}

// 테이블 데이터 정렬 함수
function sortTableData() {
    const columnIndex = headers.indexOf(sortColumn);
    if (columnIndex === -1) {
        console.error("해당 칼럼이 존재하지 않습니다.");
        return;
    }

    tableData.sort((a, b) => {
        const valueA = a[columnIndex];
        const valueB = b[columnIndex];
        if (valueA < valueB) return isAscending ? -1 : 1;
        if (valueA > valueB) return isAscending ? 1 : -1;
        return 0;
    });

    renderTable(tableData);
}

// index.html 파일에서 스크립트 로드 시 웹 워커 생성
document.addEventListener("DOMContentLoaded", () => {
    // CSV 파일 읽기 및 표로 표현하기
    Papa.parse("test.csv", {
        download: true,
        complete: function (results) {
            displayCSVAsTable(results.data);
        }
    });
});
