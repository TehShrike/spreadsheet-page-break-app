const test = require('tape')
const {
	getSheetFromResult,
	getRowsFromSheet,
	getCellsFromRow,
	cellIsColored,
	rowIsColored,
	stripHeaderFromRows,
	stripEmptyRowsFromEnd,
	splitRowsIntoPages,
	cellIsBold,
	filterColumns
} = require('./sheet-parser')

const result = Object.freeze(require('./test-result-fixture.json'))

test(`Return the nth row's data`, t => {
	const rows = getRowsFromSheet(getSheetFromResult(result, 0))
	const numberOfRowsInFirstSheet = 353

	t.equal(rows.length, numberOfRowsInFirstSheet)
	t.end()
})

test(`Get a row data's nth cell data from a row index`, t => {
	const rows = getRowsFromSheet(getSheetFromResult(result, 0))
	const secondRow = rows[1]
	const cells = getCellsFromRow(secondRow)
	const firstCell = cells[0]

	t.equal(firstCell.formattedValue, 'Cello Level 2')

	t.end()
})

test(`Detecting colored cell`, t => {
	const rows = getRowsFromSheet(getSheetFromResult(result, 0))
	const secondRow = rows[1]
	const cells = getCellsFromRow(secondRow)
	const firstCell = cells[0]
	const thirdCell = cells[2]

	t.notOk(cellIsColored(firstCell))
	t.ok(cellIsColored(thirdCell))

	t.end()
})

test(`Detecting colored row`, t => {
	const rows = getRowsFromSheet(getSheetFromResult(result, 0))
	const whiteRow = rows[0]
	const hasASingleColoredColumn = rows[37]
	const greenRow = rows[38]

	t.notOk(rowIsColored(whiteRow))
	t.notOk(rowIsColored(hasASingleColoredColumn))
	t.ok(rowIsColored(greenRow))

	t.end()
})

test(`Pull apart headers and other rows`, t => {
	const sheet = getSheetFromResult(result, 0)
	const { headers, rows } = stripHeaderFromRows(sheet)

	t.equal(headers[0], 'Cello Level 2')
	t.equal(headers[2], 'Category')

	t.equal(rows.length, 351)

	t.end()
})

test(`Strip empty rows at end`, t => {
	const rows = getRowsFromSheet(getSheetFromResult(result, 0))

	const nonEmptyRows = stripEmptyRowsFromEnd(rows)

	t.equal(nonEmptyRows.length, 343)
	t.end()
})

test(`Split rows into pages`, t => {
	const sheet = getSheetFromResult(result, 0)
	const { rows } = stripHeaderFromRows(sheet)
	const nonEmptyRows = stripEmptyRowsFromEnd(rows)

	const pages = splitRowsIntoPages(nonEmptyRows)

	t.equal(pages.length, 32)
	t.end()
})

test(`Detecting boldness`, t => {
	const rows = getRowsFromSheet(getSheetFromResult(result, 0))

	function thirdCell(someRow) {
		return getCellsFromRow(someRow)[2]
	}

	t.notOk(cellIsBold(thirdCell(rows[28])))

	t.ok(cellIsBold(thirdCell(rows[29])))

	t.end()
})

test(`Filter out columns that don't start with C`, t => {
	const sheet = getSheetFromResult(result, 0)
	const { headers: originalHeaders, rows: originalRow } = stripHeaderFromRows(sheet)

	let expectedNumber = 0
	function filter(header, i) {
		t.equal(i, expectedNumber)
		expectedNumber++
		return header && header[0].toLowerCase() === 'c'
	}

	const { headers, rows } = filterColumns({ headers: originalHeaders, rows: originalRow }, filter)

	t.equal(headers.length, 2)
	t.equal(getCellsFromRow(rows[0]).length, 2)

	t.end()
})
