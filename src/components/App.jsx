import { useState } from "react"
import "./css/base.css"

import ExcelJS from "exceljs"

function App() {
  const [output, setOutput] = useState("")
  const [status, setStatus] = useState("Copy Text")

  function getQuery(cellValues) {
    return `JS_PK IN (SELECT JN_JS FROM JobConShipLink JOIN JobConsol ON JN_JK = JK_PK where JK_UniqueConsignRef in(${cellValues}))`
  }

  async function handleExcelFile(file) {
    const allowedTypes = [
      // xls are not supported yet
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Add support for CSV in the future versions
    ]

    if (!allowedTypes.includes(file.type)) {
      window.alert("Only xlsx files are currently supported!")
      return
    }

    try {
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(file)
      const sheet = workbook.getWorksheet(1) // ._rows

      let cells = ""

      sheet.getColumn(1).eachCell((cell) => {
        if (cell.value.toUpperCase() !== "CONSOL ID") {
          cells += `'${cell.value}',`
        }
      })

      const cellsArray = cells.split("")
      cellsArray.pop()

      cells = cellsArray.join("")

      const query = getQuery(cells)
      return query
    } catch (error) {
      console.log(error)
      window.alert(error.message)
    }
    return undefined
  }

  function handlePastedText(text) {
    text = text.trim()
    let output = text.split("\n")

    let cells = ""

    output.forEach((cell) => {
      cells += `'${cell}',`
    })

    const cellsArray = cells.split("")
    cellsArray.pop()

    cells = cellsArray.join("")

    const query = getQuery(cells)
    return query
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const file = event.target.file.files[0]
    const text = event.target.pastetext.value

    let query = ""

    if (file) {
      console.log("Handling file")
      query = await handleExcelFile(file)
    } else if (text) {
      console.log("Handling pasted text")
      query = handlePastedText(text)
    } else {
      // Handle error
      alert("Please provide a file or text input")
    }

    setStatus("Copy Text")
    setOutput(query)

    event.target.reset()

    return
  }

  function handleCopyText() {
    navigator.clipboard.writeText(output)
    setStatus("Copied!")
  }

  function handleOnChange(event) {
    setOutput(event.target.value)
  }

  return (
    <div className="App">
      <div className="header">
        <h3>SQL Builder</h3>
      </div>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <section>
            <label htmlFor="file">Upload Excel File (xlsx)</label>
            <input type="file" name="file" id="file" />
          </section>

          <section>
            <label htmlFor="">Or, Paste</label>
            <small>One line per item</small>
            <textarea
              name="pastetext"
              id="query_box"
              rows="10"
              placeholder={`CNYTN-USLGB\nCNNBO-USLGB\nCNSGH-USLGB\nCNYTN-USLAX\nCNSGH-AUMEL\n`}
            ></textarea>
          </section>

          <button type="submit" className="alternative">
            Submit
          </button>
        </form>
        {output && (
          <section>
            <label htmlFor="query_box">Output SQL Query</label>
            <textarea
              name=""
              id="query_box"
              rows="4"
              value={output}
              onChange={handleOnChange}
            ></textarea>
            <button
              className="cancel"
              onClick={handleCopyText}
              onBlur={(e) => setStatus("Copy Text")}
            >
              {status}
            </button>
          </section>
        )}
      </div>
    </div>
  )
}

export default App
