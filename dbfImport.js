const pkg2 = require("dbffile");
const { DBFFile } = pkg2;
const fs = require("fs");

// dbf2mysql - imports dbf file contents and writes out a mysql insert script
// Christopher Norris 2020-11-02
// parameters:
//              filename - filename of dbf file (with path if neccessary)
//              tableName - name of table to create on mysql server
// returns: void
// --------------------------------------------------------------------------
// 2020-11-02 - initial development
async function dbf2mysql(filename, tableName) {
  // load dbf file
  let dbf = await DBFFile.open(filename);
  // get number of records
  let recCount = dbf.recordCount;
  // inform console user that we are exporting successfully
  console.log(`writing ${tableName}.sql - exporting ${recCount} rows`);
  // get records to process from dbf
  let records = await dbf.readRecords(recCount);
  // build create table portion of script
  let createTableScript = `delimiter ;;;\ncreate table if not exists ${tableName} ( \n `;
  for (let field of dbf.fields) {
    let typeText = "";
    // handle different field types by converting them to mysql types
    switch (field.type.trim()) {
      // char
      case "C":
        typeText = `varchar(${field.size})`;
        break;
      // date
      case "D":
        typeText = `datetime`;
        break;
      // numeric
      case "N":
        typeText = `int`;
        break;
      // logic
      case "L":
        typeText = "boolean";
        break;
    }
    // concatenate finished script
    createTableScript += `${field.name} ${typeText},\n`;
  }
  // remote the last comma
  createTableScript = createTableScript.substr(0, createTableScript.length - 2);
  // add the closing parenthesis and semicolon
  createTableScript += `);\n;;;`;

  // begin building insert header (to be used to insert each row)
  let insertScript = "";
  let insertHeader = `\ninsert into ${tableName} (`;
  // iterate through fields and build the insert header
  // insert into [table name] (field list comma delimited)
  for (let field of dbf.fields) {
    insertHeader += field.name + ",";
  }
  // remote last comma
  insertHeader = insertHeader.substr(0, insertHeader.length - 1) + ") VALUES (";
  // build each row to be exported
  let insertLine = "";
  // iterate through records
  for (let record of records) {
    // iterate through each field in a record
    for (let field of dbf.fields) {
      let fieldName = field.name; // get fieldName
      let fieldValue = ""; // reset fieldValue
      switch (
        field.type.trim() // handle differently dependant upon type
      ) {
        case "D":
          // convert date to ISO date (yyyy-mm-dd) string and insert surrounded by quotes
          fieldValue = new Date(record[fieldName]).toISOString().split("T")[0];
          insertLine += `'${fieldValue}',`;
          break;
        case "N":
          // insert without quotes
          fieldValue = record[fieldName];
          insertLine += `${fieldValue},`;
          break;
        case "L":
          // insert without quotes
          fieldValue = record[fieldName];
          insertLine += `${fieldValue},`;
          break;
        // insert surrounded by quotes
        case "C":
          fieldValue = record[fieldName];
          insertLine += `'${fieldValue}',`;
          break;
      }
    }
    // insert the line into the overall string being build to export
    insertLine = insertLine.substr(0, insertLine.length - 1);
    insertScript += `${insertHeader} \n ${insertLine});\n;;;`;
    insertLine = "";
  }
  // write finished strings to file
  fs.writeFile(
    `${tableName}.sql`,
    `${createTableScript} ${insertScript}\ndelimiter ;`,
    // let user know we are finished successfully
    function (err) {
      if (err) return console.log(err);
    }
  );
  console.log("export complete.");
}

// handle arguments
var myArgs = process.argv.slice(2);

// handle help
if (myArgs[0] === "--help" || myArgs[0] === "help") {
  console.log("dbf2mysql [filename] [tablename]");
} else {
  if (myArgs.length === 2) {
    // call function
    dbf2mysql(myArgs[0], myArgs[1]);
  }
}
