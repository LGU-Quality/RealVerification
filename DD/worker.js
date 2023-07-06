// 웹 워커에서 검색 동작 구현
onmessage = (event) => {
    const { data, searchInput } = event.data;

    const filteredData = data.filter((row, rowIndex) => {
        if (rowIndex === 0) return true; // 헤더는 항상 표시

        // '사용자' 또는 '실사결과' 칼럼에서 검색어와 일치하는 경우에만 표시
        const userColumnIndex = data[0].indexOf('사용자');
        const resultColumnIndex = data[0].indexOf('끝번호');

        const userMatch = row[userColumnIndex].toUpperCase().includes(searchInput.toUpperCase());
        const resultMatch = row[resultColumnIndex].toUpperCase().includes(searchInput.toUpperCase());

        return userMatch || resultMatch;
    });

    postMessage(filteredData);
};
