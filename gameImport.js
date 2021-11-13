const xlsxFile = require("read-excel-file/node");
var request = require("request");
const http = require("http");
const fs = require("fs");

xlsxFile("./gamestoimport.xlsx").then((rows) => {
  var count = 0;
  for (i in rows) {
    console.log(rows[i][1]);
    var gamename = rows[i][1];
    var gamecategories = rows[i][2].replace(/ /g, "");
    var gameurl = rows[i][3];
    var gameimage = rows[i][4];
    var gametext = rows[i][5];
    var macsgameimage = gamename.replace(/&/g, "").replace(/ /g, "") + ".png";

    download(
      gameimage.replace("64x64", "128x128"),
      "./img/" + macsgameimage,
      () => {
        console.log("done.");
      }
    );

    var data = {
      audituser: "facebook|xxxxxxxxx",
      gamecatalogid: "new",
      gamename: gamename,
      gameurl: gameurl,
      gamepaytype: "Credit Based",
      gamecategories: gamecategories,
      gameid: "game" + count,
      gametext: gametext,
      creditcost: "1",
      minpercredit: "1",
      gameimage: "https://macsgameboard.com/img/thumbs/" + macsgameimage,
    };

    console.log(data);
    writelog(JSON.stringify(data) + "\n");
    var options = {
      method: "POST",
      url: "https://xxxx.amazonws.com/v1/addupdategame",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "xxxxx",
      },
      body: JSON.stringify(data),
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });

    count++;
  }
});
const writelog = (what) => {
  fs.appendFile(
    "log.txt",
    what,
    "utf8",
    // callback function
    function (err) {
      if (err) throw err;
      // if no error
      console.log("Data is appended to file successfully.");
    }
  );
};
const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    if (err) {
      console.log("error:" + url);
    }
    request(url).pipe(fs.createWriteStream(path)).on("close", callback);
  });
};
