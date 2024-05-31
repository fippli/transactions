#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

// 2nd argument of command line is the relative path to the input file
const file = path.resolve("./", process.argv[2]);

const add = (x, y) => x + y;

const addNumberSpacing = (number) => {
  // add a space for each 3rd digit from the right
  number = number.toString();
  const numberLength = number.length;
  let formattedNumber = "";
  for (let i = 0; i < numberLength; i++) {
    formattedNumber = number[numberLength - 1 - i] + formattedNumber;
    if ((i + 1) % 3 === 0 && i !== numberLength - 1) {
      formattedNumber = " " + formattedNumber;
    }
  }

  return formattedNumber;
};

const getPadding = (compareLength, maxLength, char) =>
  new Array(maxLength - compareLength + 1).join(char);

const findLongestString = (strings) => {
  return strings.reduce((longestSoFar, stringToCompareWithTheLongestSoFar) => {
    if (stringToCompareWithTheLongestSoFar.length > longestSoFar.length) {
      return stringToCompareWithTheLongestSoFar;
    } else {
      return longestSoFar;
    }
  }, "");
};

const createRows = (rows) => {
  let rowObjects = rows.reduce((allRows, CSVRow) => {
    const [_0, _1, _2, _3, _4, _5, transaction, description] = CSVRow;
    // Only add the row if the transaction is negative
    if (parseFloat(transaction) < 0) {
      return [
        ...allRows,
        {
          description,
          transaction: Math.abs(parseFloat(transaction)),
        },
      ];
    } else {
      return allRows;
    }
  }, []);

  // Add the sum of all rows
  const sumRow = {
    description: "Total",
    transaction: rowObjects
      .map((row) => row.transaction)
      .reduce(add, 0)
      .toString(),
  };

  rowObjects.push(sumRow);

  rowObjects = rowObjects.map((row) => ({
    ...row,
    transaction: addNumberSpacing(row.transaction).toString(),
  }));

  const longestDescription = findLongestString(
    rowObjects.map(({ description }) => description)
  );

  const longestNumber = findLongestString(
    rowObjects.map(({ transaction }) => transaction)
  );

  return rowObjects.map((row) => ({
    description: `${row.description}${getPadding(
      row.description.length,
      longestDescription.length,
      "."
    )}`,
    transaction: `${getPadding(
      row.transaction.length,
      longestNumber.length,
      " "
    )}${row.transaction}`,
  }));
};

const main = () => {
  const rows = [];

  fs.createReadStream(file)
    .pipe(parse({ delimiter: ";", from_line: 2 }))
    .on("data", (CSVRow) => {
      rows.push(CSVRow);
    })
    .on("end", () => {
      console.log(
        createRows(rows)
          .map((row) => `${row.description} ${row.transaction} kr`)
          .join("\n")
      );
    })
    .on("error", (error) => {
      console.log(error.message);
    });
};

main();
