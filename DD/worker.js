// worker.js

// The rest of your web worker code here

// Example usage of PapaParse inside the web worker
// self.onmessage = function(event) {
//     // Access the Papa object within the web worker
//     const Papa = self.Papa;
  
//     // Now you can use Papa for CSV parsing and other operations
//     // For example:
//     const csvData = event.data; // This should be the CSV data sent from the main thread
//     const parsedData = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  
//     // Send the parsed data back to the main thread
//     self.postMessage(parsedData.data);
// };

// worker.js

// 웹 워커가 메인 스레드로부터 메시지를 받을 때 호출되는 콜백 함수
self.onmessage = function (event) {
    // CSV 파일을 비동기적으로 로드합니다.
    fetch(event.data)
      .then(response => response.text())
      .then(data => {
        // CSV 데이터를 파싱합니다.
        const parsedData = Papa.parse(data, { header: true, skipEmptyLines: true });
  
        // 파싱된 CSV 데이터를 메인 스레드로 전송합니다.
        self.postMessage(parsedData.data);
        console.log("성공");
        console.log(parsedData.data);
      })
      .catch(error => {
        // 에러가 발생한 경우 메인 스레드로 에러를 전송합니다.
        self.postMessage({ error: 'CSV 파일을 로드하는 중 오류가 발생했습니다.' });
      });
  };
  