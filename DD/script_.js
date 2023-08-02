// Global variables
let tableData = [];
let filteredData = [];
const tableHeaders = ['No', '타입', '모델', '가번', 'MAC', '사용자', '끝번호', '구분', '실사결과', '비고'];
let sortColumn = '';
let sortDirection = '';
const pageSize = 50;
let currentPage = 1;
let isDataLoaded = false;
const SORT_ASC = 'asc';
const SORT_DESC = 'desc';

const papaParseWorker = `
  // Load papaparse library script
  self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js');

  self.onmessage = function (event) {
    const csvData = event.data;
    const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    self.postMessage(parsedData);
  };
`;

// Function to handle lazy loading and pagination
function handleLazyLoad() {
  const scrollPosition = window.scrollY;
  const totalHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;

  if (scrollPosition + windowHeight >= totalHeight - 100) {
    if (filteredData.length > 0) {
      handlePagination(); // filteredData가 비어있지 않을 경우에만 페이지네이션을 수행하도록 수정
    }
  }
}

// Function to handle pagination
function handlePagination() {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filteredData.slice(start, end); // filteredData를 사용하도록 수정

  buildTableFromData(pageData);

  currentPage++;
}

// Function to load CSV data and build the initial table
function loadTableData() {
  const csvUrl = 'silsa.csv';
  const workerScript = `
    ${papaParseWorker}
    // Add your custom worker code here
  `;

  // Create a Blob URL for the web worker script
  const workerBlob = new Blob([workerScript], { type: 'application/javascript' });
  const workerScriptUrl = URL.createObjectURL(workerBlob);

  // Create a web worker
  const worker = new Worker(workerScriptUrl);

  // Load the CSV data using the web worker
  fetch(csvUrl)
    .then(response => response.text())
    .then(data => {
      worker.postMessage(data);
    })
    .catch(error => {
      console.error('CSV 파일을 로드하는 중 오류가 발생했습니다:', error);
    });

  // Handle messages from the web worker
  worker.onmessage = function (event) {
    const parsedData = event.data;
    tableData = parsedData.data;

    // Build the table with the loaded data
    buildTable();

    // Enable pagination and lazy loading
    // window.addEventListener('scroll', handleLazyLoad);
  };
}

// Function to build the initial table
function buildTable() {
  // Get the table container element
  const tableContainer = document.getElementById('tableContainer');

  // Remove the existing table
  tableContainer.innerHTML = '';

  // Create the table element
  const table = document.createElement('table');

  // Create the table header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Add each header cell to the header row
  tableHeaders.forEach(headerText => {
    const headerCell = document.createElement('th');
    headerCell.textContent = headerText;
    headerCell.style.whiteSpace = 'nowrap';

    // 컬럼 헤더 클릭 이벤트를 추가합니다.
    headerCell.addEventListener('click', function () {
      sortTable(headerText);
    });

    headerRow.appendChild(headerCell);
  });

  // Append the header row to the table header
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create the table body
  const tbody = document.createElement('tbody');

  // Add each data row to the table body
  tableData.forEach(rowData => {
    const row = document.createElement('tr');

    tableHeaders.forEach(headerText => {
      const cell = document.createElement('td');
      cell.style.whiteSpace = 'nowrap';

      if (rowData[headerText] === '0') {
        cell.innerHTML = '&nbsp;'; // HTML 공백 문자열로 설정
      } else {
        cell.textContent = rowData[headerText];
      }

      if (headerText === '비고') {
        cell.style.textAlign = 'left';
      }

      row.appendChild(cell);
    });

    // Apply styling to rows with '실사결과' as '완료'
    if (rowData['실사결과'] === '완료') {
      row.classList.add('completed');
    }

    tbody.appendChild(row);
  });

  // Append the table body to the table
  table.appendChild(tbody);

  // 정렬 기준 컬럼과 방향 초기화
  sortColumn = '';
  sortDirection = '';

  // 컬럼 헤더 클릭 이벤트를 추가합니다.
  addHeaderClickEvent();

  // '사용자'별로 '실사결과' 값이 모두 '완료'인 수 추출
  const completedUsers = {};
  const notcompletedUsers = {};
  const totalUsers = {};
  const userNumbers = {};
  const userNames = {};
  tableData.forEach(rowData => {
    const user = rowData['사용자'] + rowData['끝번호'];
    const result = rowData['실사결과'];
    const number = rowData['끝번호'];
    const name = rowData['사용자'];
    if (result === '완료') {
      if (completedUsers[user]) {
        completedUsers[user]++;
      } else {
        completedUsers[user] = 1;
      }
    } else {
      if (notcompletedUsers[user]) {
        notcompletedUsers[user]++;
      } else {
        notcompletedUsers[user] = 1;
      }
    }
    if (totalUsers[user]) {
      totalUsers[user]++;
    } else {
      totalUsers[user] = 1;
    }
    if (!userNumbers[user]) {
      userNumbers[user] = number;
    }
    if (!userNames[user]) {
      userNames[user] = name;
    }
  });

  var completedCnt = 0;
  var completedUser = '';
  var notcompletedCnt = 0;
  var notcompletedUser = '';

  // 전체 사용자별 항목 수 대비 완료된 항목 수가 같은 경우 숫자 출력
  const sortedUsers = Object.keys(completedUsers).sort(); // 사용자 이름 오름차순 정렬
  sortedUsers.forEach((user, index) => {
    const completedCount = completedUsers[user];
    const totalCount = totalUsers[user];
    const userNumber = userNumbers[user];
    const userName = userNames[user];
    if (completedCount === totalCount) {
      if (userName && userNumber) {
        completedUser += `${userName}(${userNumber})`;
        if (index !== sortedUsers.length - 1) {
          completedUser += ', ';
        }
      }
      completedCnt++;
    } 
  });

  
  const sortedUsersN = Object.keys(notcompletedUsers).sort(); // 사용자 이름 오름차순 정렬
  sortedUsersN.forEach((user, index) => {
    const completedCount = completedUsers[user];
    const totalCount = totalUsers[user];
    const userNumber = userNumbers[user];
    const userName = userNames[user];
    if (completedCount != totalCount) {
      if (userName && userNumber) {
        notcompletedUser += `${userName}(${userNumber})`;
        if (index !== sortedUsersN.length - 1) {
          notcompletedUser += ', ';
        }
      }
      notcompletedCnt++;
    } 
  });

  // '모든 시료 확인 완료 인원' 업데이트
  const completedCountElement = document.getElementById('completedCount');
  completedCountElement.textContent = completedCnt;

  // const completedUserElement = document.getElementById('completedUser');
  // completedUserElement.textContent = completedUser;

  const notcompletedCountElement = document.getElementById('notcompletedCount');
  notcompletedCountElement.textContent = notcompletedCnt;

  const notcompletedUserElement = document.getElementById('notcompletedUser');
  notcompletedUserElement.textContent = notcompletedUser;
}

// Function to build the table with data
function buildTableFromData(data) {
  // Get the table container element
  const tableContainer = document.getElementById('tableContainer');

  // If the table already exists, only update the table body (tbody)
  if (tableContainer.querySelector('table')) {
    const tbody = tableContainer.querySelector('tbody');
    tbody.innerHTML = ''; // Clear the existing table body
    addTableRows(tbody, data); // Add rows to the table body with the given data
  } else {
    // Create the table element
    const table = document.createElement('table');

    // Create the table header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Add each header cell to the header row
    tableHeaders.forEach(headerText => {
      const headerCell = document.createElement('th');
      headerCell.textContent = headerText;
      headerCell.style.whiteSpace = 'nowrap';
      headerRow.appendChild(headerCell);
    });

    // Append the header row to the table header
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement('tbody');
    addTableRows(tbody, data); // Add rows to the table body with the given data
    table.appendChild(tbody);

    // Append the table to the table container
    tableContainer.appendChild(table);
  }

  // 컬럼 헤더 클릭 이벤트를 추가합니다.
  addHeaderClickEvent();
}

// Function to add table rows to the table body
function addTableRows(tbody, data) {
  data.forEach(rowData => {
    const row = document.createElement('tr');

    tableHeaders.forEach(headerText => {
      const cell = document.createElement('td');
      cell.style.whiteSpace = 'nowrap';

      if (rowData[headerText] === '0') {
        cell.innerHTML = '&nbsp;'; // HTML 공백 문자열로 설정
      } else {
        cell.textContent = rowData[headerText];
      }

      if (headerText === '비고') {
        cell.style.textAlign = 'left';
      }

      row.appendChild(cell);
    });

    // Apply styling to rows with '실사결과' as '완료'
    if (rowData['실사결과'] === '완료') {
      row.classList.add('completed');
    }

    tbody.appendChild(row);
  });
}

// Function to handle the search button click
function performSearch() {
  // Get the search values
  const searchUser = document.getElementById('searchUser').value.trim().toLowerCase();
  const tempUser = searchUser.replace(/^(.)(.)/, function (match, firstChar, secondChar) {
    return firstChar + "*";
  });

  const searchEndNumber = document.getElementById('searchEndNumber').value.trim().toLowerCase();
  const tempNumber = searchEndNumber.toString().replace(/.$/, "*");

  let notCompletedCnt = 0;
  // Filter the table data based on the search values

  if ((tempUser === '') && (tempNumber === '')) {
    filteredData = tableData.filter(rowData => {
      const resultMatch = rowData['실사결과'].toLowerCase() != '완료';
      if (resultMatch) { notCompletedCnt++; }
      return resultMatch;
    });
  }
  else {
    filteredData = tableData.filter(rowData => {
      const userMatch = rowData['사용자'].toLowerCase().includes(tempUser);
      const endNumberMatch = rowData['끝번호'].toLowerCase().includes(tempNumber);
      const resultMatch = rowData['실사결과'].toLowerCase() === '완료';
      if (userMatch && endNumberMatch && !resultMatch) { notCompletedCnt++; }
      return userMatch && endNumberMatch;
    });
  }

  buildTableFromData(filteredData);

  console.log(notCompletedCnt);
  const completedUserElement = document.getElementById('userDetail');
  if (notCompletedCnt === 0) {
    completedUserElement.textContent = searchUser + '(' + searchEndNumber + ') 님은 실사가 완료되셨습니다.';
  } else {
    completedUserElement.innerHTML = `${tempUser}(${tempNumber}) 님은 <span style="color: red">${notCompletedCnt} 개 시료 추가 확인</span>이 필요합니다. - 단말이 분실되었을 경우 알려주시면 완료처리 진행하도록 하겠습니다.`;
  }

  currentPage = 1; // 검색 시 현재 페이지를 1로 초기화
}


// 컬럼 헤더 클릭 이벤트를 추가하는 함수
function addHeaderClickEvent() {
  const headerCells = document.querySelectorAll('th');

  headerCells.forEach((headerCell, index) => {
    headerCell.addEventListener('click', () => {
      sortTable(index); // 컬럼의 인덱스 값을 전달하여 정렬 수행
    });
  });
}

// 테이블 정렬을 수행하는 함수
function sortTable(column) {
  // 현재 정렬 기준 컬럼과 방향을 업데이트합니다.
  if (sortColumn === column) {
    // 현재 컬럼과 같은 경우 방향을 반대로 변경합니다.
    sortDirection = sortDirection === SORT_ASC ? SORT_DESC : SORT_ASC;
  } else {
    // 현재 컬럼과 다른 경우 오름차순으로 설정합니다.
    sortColumn = column;
    sortDirection = SORT_ASC;
  }

  // 정렬을 수행할 대상 데이터를 설정합니다.
  const targetData = filteredData.length > 0 ? filteredData : tableData;

  // 대상 데이터를 정렬합니다.
  targetData.sort((a, b) => {
    const columnTextA = String(a[tableHeaders[sortColumn]]).toLowerCase();
    const columnTextB = String(b[tableHeaders[sortColumn]]).toLowerCase();

    if (sortDirection === SORT_ASC) {
      return columnTextA.localeCompare(columnTextB);
    } else {
      return columnTextB.localeCompare(columnTextA);
    }
  });

  // 테이블을 다시 빌드합니다.
  buildTableFromData(targetData);

  // 정렬 방향에 따라 헤더 셀에 클래스를 추가합니다.
  const headerCells = document.querySelectorAll('th');
  headerCells.forEach((headerCell, index) => {
    if (index === sortColumn) {
      headerCell.classList.remove(SORT_ASC, SORT_DESC);
      headerCell.classList.add(sortDirection);
    } else {
      headerCell.classList.remove(SORT_ASC, SORT_DESC);
    }
  });
}

// ... (이하 이전 코드)

// Function to handle the search button click
function handleSearchButtonClick() {
  // 입력값에 따라 필터링된 데이터를 구성합니다.
  performSearch();
}

// Event listener for the search button click
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', handleSearchButtonClick);

const completedUserElement = document.getElementById('userDetail');
completedUserElement.textContent = "이름 혹은 전화번호로 검색해 주세요.";
completedUserElement.innerHTML = `<span style="color: red">이름 혹은 전화번호로 검색해 주세요.</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  - 단말이 분실되었을 경우 알려주시면 완료처리 진행하도록 하겠습니다.`;

// Load the table data on page load
loadTableData().then(() => {
  // 검색 필드의 입력 이벤트에 반응하지 않도록 수정
  // window.addEventListener('scroll', handleLazyLoad);
  
});
