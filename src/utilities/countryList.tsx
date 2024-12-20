import { parse } from 'csv-parse';
import * as fs from "fs";
import * as path from "path";

async function parseCountries() {    
    const csvFilePath = path.resolve('src/utilities/country_list.csv');

    const headers  = ['country_name', 'country_code', 'phone_code'];
    const fileContent = await fs.promises.readFile(csvFilePath, {encoding: 'utf-8'});

    return new Promise((resolve, reject) => {
        parse(fileContent, {
            delimiter: ',',
            columns: headers,
        }, (err, records) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise in case of error
            } else {
                // console.log(records);
                resolve(records); // Resolve the promise with parsed records
            }
        });
    });
}

export default parseCountries;