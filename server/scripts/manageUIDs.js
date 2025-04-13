import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.join(__dirname, '../data/student_uids.csv');

export const addUID = async (uid, department, year) => {
  const csvWriter = createObjectCsvWriter({
    path: CSV_PATH,
    append: true,
    header: ['uid', 'department', 'year', 'status']
  });

  await csvWriter.writeRecords([{
    uid,
    department,
    year,
    status: 'active'
  }]);
};

export const deactivateUID = async (uid) => {
  const records = [];
  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => {
      if (row.uid === uid) {
        row.status = 'inactive';
      }
      records.push(row);
    })
    .on('end', async () => {
      const csvWriter = createObjectCsvWriter({
        path: CSV_PATH,
        header: ['uid', 'department', 'year', 'status']
      });
      await csvWriter.writeRecords(records);
    });
};

// You can add more functions to manage UIDs as needed
