"use strict";

const axios = require('axios');
// const XLSX = require('xlsx');
const XLSX = require('xlsx-color');
const fs = require('fs');
const _ = require('lodash');
const {Logger} = require('@pieropatron/tinylogger');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const logger = new Logger('script');

const SVC = require('./svc.json');

const run = async ()=>{
	const api_result = await axios.get(`https://api.publicapis.org/entries`);

	const report = _.chain(api_result.data.entries)
		.filter(row=>row.HTTPS !== false)
		.sortBy('API')
		.value();

	const doc = new GoogleSpreadsheet();
	doc.useServiceAccountAuth(SVC);
	await doc.createNewSpreadsheetDocument({title: "test sheet"});
	await doc.loadInfo();
	const sheet1 = doc.sheetsByIndex[0];
	await sheet1.setHeaderRow(_.keys(report[0]));
	await sheet1.addRows(report);
	await doc.loadInfo();
	await sheet1.loadHeaderRow();
	await sheet1.loadCells();

	const columns = "ABCDEFG";
	for (let i=0; i<columns.length; i++){
		const cell = sheet1.getCellByA1(columns[i] + "1");
		cell.backgroundColor = {
			red: 129,
			green: 212,
			blue: 26,
			alpha: 0
		};
		await cell.save();
	}

	const buffer = await doc.downloadAsXLSX();
	await fs.writeFileSync(__dirname + "/report_google.xlsx", buffer);
};

run().then(()=>{
	logger.info(`script succeed`);
	process.exit(0);
}, error=>{
	logger.fatal(error);
	process.exit(1);
});
