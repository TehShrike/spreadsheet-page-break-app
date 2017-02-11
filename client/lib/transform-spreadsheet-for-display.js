const {
	getSheetFromResult,
	getCellsFromRow,
	stripHeaderFromRows,
	stripEmptyRowsFromEnd,
	splitRowsIntoPages,
	cellIsBold,
	getCellDisplayValue,
	filterColumns
} = require('./sheet-parser')

module.exports = function transformSpreadsheetForDisplay(result, columnFilter) {
	const sheet = getSheetFromResult(result, 0)
	const { headers, rows } = filterColumns(stripHeaderFromRows(sheet), columnFilter)
	const nonEmptyRows = stripEmptyRowsFromEnd(rows)
	const pagesOfRows = splitRowsIntoPages(nonEmptyRows)

	const pagesForDisplay = pagesOfRows.map(transformRowsForDisplay)

	return {
		headers,
		pages: pagesForDisplay
	}
}

function transformRowsForDisplay(rows) {
	return rows.map(getCellsFromRow).map(cells => {
		return cells.map(cell => {
			return {
				bold: cellIsBold(cell),
				text: getCellDisplayValue(cell)
			}
		})
	})
}
