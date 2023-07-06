// Global variables
let tableData = []; // To store the CSV data
const tableHeaders = ['No', '타입', '구분', '모델', '가번', 'MAC', '사용자', '끝번호', '실사결과', '비고'];

// Function to load CSV data and build the initial table
function loadTableData() {
  // Fetch the CSV file
  Papa.parse('test.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      // Save the parsed CSV data to the tableData variable
      tableData = results.data;

      // Build the initial table
      buildTable();
    }
  });
}

// Function to build the initial table
function buildTable() {
  // Get the table container element
  const tableContainer = document.getElementById('tableContainer');

  // Create the table element
  const table = document.createElement('table');

  // Create the table header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Add each header cell to the header row
  tableHeaders.forEach(headerText => {
    const headerCell = document.createElement('th');
    headerCell.textContent = headerText;

    if (headerText === '사용자') {
      headerCell.style.minwidth = '150px'; // '사용자' 칼럼의 너비
    } else if (headerText === '끝번호') {
      headerCell.style.minwidth = '150px'; // '끝번호' 칼럼의 너비
    }
    headerCell.style.whiteSpace = 'nowrap';

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
      cell.textContent = rowData[headerText];
      cell.style.whiteSpace = 'nowrap';
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
}

// Function to handle the search button click
function performSearch() {
  // Get the search values
  const searchUser = document.getElementById('searchUser').value.trim().toLowerCase();
  const searchEndNumber = document.getElementById('searchEndNumber').value.trim().toLowerCase();

  // Filter the table data based on the search values
  const searchResults = tableData.filter(rowData => {
    const userMatch = rowData['사용자'].toLowerCase().includes(searchUser);
    const endNumberMatch = rowData['끝번호'].toLowerCase().includes(searchEndNumber);
    return userMatch && endNumberMatch;
  });

  // Rebuild the table with the search results
  buildTableFromData(searchResults);
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
      cell.textContent = rowData[headerText];
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
}

// Function to handle the search button click
function handleSearchButtonClick() {
  performSearch();
}

// Event listener for the search button click
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', handleSearchButtonClick);

// Load the table data on page load
loadTableData();
