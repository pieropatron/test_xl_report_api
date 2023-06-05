"use strict";

const axios = require('axios');
const XLSX = require('xlsx-color');
const fs = require('fs');
const _ = require('lodash');
const {Logger} = require('@pieropatron/tinylogger');

const logger = new Logger('script');;

const run = async ()=>{
	const api_result = await axios.get(`https://api.publicapis.org/entries`);

	const report = _.chain(api_result.data.entries)
		.filter(row=>row.HTTPS !== false)
		.sortBy('API')
		.value();

	const sheet = XLSX.utils.json_to_sheet(report);
	const columns = "ABCDEFG";
	_.each(columns, char=>{
		sheet[char + "1"].s = {
			fill: {
				patternType: "solid",
				fgColor: { rgb: "81d41a" }
			}
		}
	});

	_.each(report, (row, i)=>{
		sheet["F" + (i+2)].l = {
			Target: row.Link,
			Tooltip: row.API
		};
	});

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet 1');
	XLSX.writeFile(workbook, "report.xlsx", {bookSST: true, bookType: 'xlsx'});
};

run().then(()=>{
	logger.info(`script succeed`);
	process.exit(0);
}, error=>{
	logger.fatal(error);
	process.exit(1);
});
