function myFunction() {
  const data = UrlFetchApp.fetch("https://api.publicapis.org/entries", {
    method: "get",
  });
  const response_text = data.getContentText();
  const response = JSON.parse(response_text);
  let report = response.entries;
  report = report.filter(row=>row.HTTPS !== false);
  report = report.sort((row1, row2)=>{
    if (row1.API > row2.API){
      return 1;
    } else if (row1.API < row2.API){
      return -1;
    } else {
      return 0;
    }
  });


  const ss = SpreadsheetApp.create("Test_Report");
  const sheet1 = ss.getActiveSheet();
  const field_names = Object.keys(report[0]);
  sheet1.appendRow(field_names);

  report.forEach(row=>{
    const values = field_names.map(key=>{
      return row[key] || "";
    });
    sheet1.appendRow(values);
  });

  const range = sheet1.getRange(1, 1, 1, field_names.length);
  range.setBackground("#81d41a");
  const blob = ss.getBlob();
  const fileString = blob.getDataAsString();
  ContentService.createTextOutput(fileString).downloadAsFile("report_apps.xlsx");
}
