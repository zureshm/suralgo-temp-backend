const fs = require("fs")
const csv = require("csv-parser")

function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        rows.push({
          time: row.time,
          open: Number(row.open),
          high: Number(row.high),
          low: Number(row.low),
          close: Number(row.close)
        })
      })
      .on("end", () => resolve(rows))
      .on("error", reject)
  })
}

module.exports = loadCSV