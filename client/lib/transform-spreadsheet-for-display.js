const {
	getSheetFromResult,
	getCellsFromRow,
	stripHeaderFromRows,
	stripEmptyRowsFromEnd,
	splitRowsIntoPages,
	cellIsBold,
	getCellDisplayValue
} = require('./sheet-parser')

module.exports = function transformSpreadsheetForDisplay(result) {
	const sheet = getSheetFromResult(result, 0)
	const { header, rows } = stripHeaderFromRows(sheet)
	const nonEmptyRows = stripEmptyRowsFromEnd(rows)
	const pagesOfRows = splitRowsIntoPages(nonEmptyRows)

	const pagesForDisplay = pagesOfRows.map(transformRowsForDisplay)

	return {
		header,
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
