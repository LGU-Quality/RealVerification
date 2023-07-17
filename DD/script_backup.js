// Global variables
let tableData = []; // To store the CSV data
let filteredData = []; // To store the filtered data after performing search
const tableHeaders = ['No', '타입', '구분', '모델', '가번', 'MAC', '사용자', '끝번호', '실사결과', '비고'];
let sortColumn = ''; // 정렬 기준 컬럼
let sortDirection = ''; // 정렬 방향

// Function to load CSV data and build the initial table
function loadTableData() {
  // CSV 파일을 가져옵니다.
  fetch('silsa.csv')
    .then(response => response.text())
    .then(data => {
      // CSV 데이터를 파싱합니다.
      const parsedData = Papa.parse(data, { header: true, skipEmptyLines: true });

      // 파싱된 CSV 데이터를 tableData 변수에 저장합니다.
      tableData = parsedData.data;

      // 초기 테이블을 생성합니다.
      buildTable();
    })
    .catch(error => {
      console.error('CSV 파일을 로드하는 중 오류가 발생했습니다:', error);
    });
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
    headerCell.addEventListener('click', function() {
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
      // cell.textContent = rowData[headerText] || '&nbsp;'; // 빈 문자열인 경우 공백으로 설정
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

  // Append the table to the table container
  tableContainer.appendChild(table);

  // 정렬 기준 컬럼과 방향 초기화
  sortColumn = '';
  sortDirection = '';

  // 컬럼 헤더 클릭 이벤트를 추가합니다.
  addHeaderClickEvent();

  // '사용자'별로 '실사결과' 값이 모두 '완료'인 수 추출
  const completedUsers = {};
  const totalUsers = {};
  const userNumbers = {};
  const userNames = {};
  tableData.forEach(rowData => {
    const user = rowData['사용자']+rowData['끝번호'];
    const result = rowData['실사결과'];
    const number = rowData['끝번호'];
    const name = rowData['사용자'];
    // if ((result === '완료') || (result === '추가확인필요')) {
    if (result === '완료') {
      if (completedUsers[user]) {
        completedUsers[user]++;
      } else {
        completedUsers[user] = 1;
      }
    }
    if (totalUsers[user]) {
      totalUsers[user]++;
    } else {
      totalUsers[user] = 1;
    }
    if (!userNumbers[user]) { userNumbers[user] = number; }
    if (!userNames[user]) { userNames[user] = name; }
  });

  var completedCnt=0;
  var completedUser = '';
  console.log(completedUsers);

  // 전체 사용자별 항목 수 대비 완료된 항목 수가 같은 경우 숫자 출력
  const sortedUsers = Object.keys(completedUsers).sort(); // 사용자 이름 오름차순 정렬
  sortedUsers.forEach((user, index) => {
    const completedCount = completedUsers[user];
    const totalCount = totalUsers[user];
    const userNumber = userNumbers[user];
    const userName = userNames[user];
    if (completedCount === totalCount) {
      console.log(`사용자 ${user}: ${completedCount}`);
      console.log(userName);
      if (userName && userNumber) {
        completedUser += `${userName}(${userNumber})`;
        if (index !== sortedUsers.length - 1) {
          completedUser += ', ';
        }
      }
      completedCnt++;
    }
  });


  // '모든 시료 확인 완료 인원' 업데이트
  const completedCountElement = document.getElementById('completedCount');
  completedCountElement.textContent = completedCnt;

  const completedUserElement = document.getElementById('completedUser');
  completedUserElement.textContent = completedUser;
}


// Function to build the table with data
function buildTableFromData(data) {
  // Get the table container element
  const tableContainer = document.getElementById('tableContainer');

  // Clear any existing table
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
    headerRow.appendChild(headerCell);
  });

  // Append the header row to the table header
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create the table body
  const tbody = document.createElement('tbody');

  // Add each data row to the table body
  data.forEach(rowData => {
    const row = document.createElement('tr');

    tableHeaders.forEach(headerText => {
      const cell = document.createElement('td');
      // cell.textContent = rowData[headerText] || ' '; // 빈 문자열인 경우 공백으로 설정
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

  // Append the table to the table container
  tableContainer.appendChild(table);

  // 컬럼 헤더 클릭 이벤트를 추가합니다.
  addHeaderClickEvent();
}

// Function to handle the search button click
function performSearch() {
  // Get the search values
  const searchUser = document.getElementById('searchUser').value.trim().toLowerCase();
  const tempUser = searchUser.replace(/^(.)(.)/, function(match, firstChar, secondChar) {
    return firstChar + "*";
  });

  const searchEndNumber = document.getElementById('searchEndNumber').value.trim().toLowerCase();
  const tempNumber = searchEndNumber.toString().replace(/.$/, "*");

  console.log("이름 입력 값: %s, 검색 값: %s, 번호 입력 값: %s, 검색 값: %s", searchUser, tempUser, searchEndNumber, tempNumber);

  // Clear the table container
  tableContainer.innerHTML = '';

  // Filter the table data based on the search values
  filteredData = tableData.filter(rowData => {
    const userMatch = rowData['사용자'].toLowerCase().includes(tempUser);
    const endNumberMatch = rowData['끝번호'].toLowerCase().includes(tempNumber);
    return userMatch && endNumberMatch;
  });

  // Rebuild the table with the search results
  buildTableFromData(filteredData);
}

// Function to handle the search button click
function handleSearchButtonClick() {
  performSearch();
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
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    // 현재 컬럼과 다른 경우 오름차순으로 설정합니다.
    sortColumn = column;
    sortDirection = 'asc';
  }

  // 정렬을 수행할 대상 데이터를 설정합니다.
  const targetData = filteredData.length > 0 ? filteredData : tableData;

  // 대상 데이터를 정렬합니다.
  targetData.sort((a, b) => {
    const columnTextA = String(a[tableHeaders[sortColumn]]).toLowerCase();
    const columnTextB = String(b[tableHeaders[sortColumn]]).toLowerCase();

    if (sortDirection === 'asc') {
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
      headerCell.classList.remove('asc', 'desc');
      headerCell.classList.add(sortDirection === 'asc' ? 'asc' : 'desc');
    } else {
      headerCell.classList.remove('asc', 'desc');
    }
  });
}

// Event listener for the search button click
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', handleSearchButtonClick);

// Load the table data on page load
loadTableData();