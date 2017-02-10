const combine = require('combine-arrays')

function getSheetFromResult(result, sheetNumber) {
	return result.sheets[sheetNumber]
}

function getRowsFromSheet(sheet) {
	return sheet.data[0].rowData
}

function getCellsFromRow(rowData) {
	return rowData.values
}

function getRowFromCells(cells) {
	return {
		values: cells
	}
}

function cellIsColored(cellData) {
	const { red, green, blue } = cellData.effectiveFormat.backgroundColor

	return red < 1 || green < 1 || blue < 1
}

function rowIsColored(rowData) {
	return getCellsFromRow(rowData).every(cellIsColored)
}

function stripHeaderFromRows(sheet) {
	const frozenRows = sheet.properties.gridProperties.frozenRowCount
	const rows = getRowsFromSheet(sheet)

	const headerRow = frozenRows > 0 ? rows[frozenRows - 1] : null
	const headers = getCellsFromRow(headerRow).map(getCellDisplayValue)

	return {
		headers,
		rows: rows.slice(frozenRows)
	}
}

function getCellDisplayValue(cell) {
	return cell.formattedValue
}

function stripEmptyRowsFromEnd(rows) {
	let lastNonEmptyRow = rows.length - 1
	let foundNonEmptyRow = false

	while (lastNonEmptyRow > 0 && !foundNonEmptyRow) {
		const cells = getCellsFromRow(rows[lastNonEmptyRow])
		const isEmpty = !getCellDisplayValue(cells[0])

		if (isEmpty) {
			lastNonEmptyRow--
		} else {
			foundNonEmptyRow = true
		}
	}

	return rows.slice(0, lastNonEmptyRow + 1)
}

function splitRowsIntoPages(rows) {
	const allPages = []
	let currentPage = []

	function finishCurrentPage() {
		if (currentPage.length > 0) {
			allPages.push(currentPage)
			currentPage = []
		}
	}

	rows.forEach(row => {
		const isPageBreakRow = rowIsColored(row)

		if (isPageBreakRow) {
			finishCurrentPage()
		} else {
			currentPage.push(row)
		}
	})

	finishCurrentPage()

	return allPages
}

function cellIsBold(cell) {
	return cell.effectiveFormat && cell.effectiveFormat.textFormat.bold
}

function filterColumns({ headers, rows }, filterFn) {
	const filterValues = headers.map((header, i) => {
		return !!filterFn(header, i)
	})

	const filteredHeaders = combine({ headers, filterValues })
		.filter(({ filterValues }) => filterValues)
		.map(({ headers }) => headers)

	const filteredRows = rows.map(row => {
		const cells = getCellsFromRow(row)

		const filteredCells = combine({ cells, filterValues })
			.filter(({ filterValues }) => filterValues)
			.map(({ cells }) => cells)

		return getRowFromCells(filteredCells)
	})

	return {
		headers: filteredHeaders,
		rows: filteredRows
	}
}

module.exports = {
	getSheetFromResult,
	getRowsFromSheet,
	getCellsFromRow,
	cellIsColored,
	rowIsColored,
	stripHeaderFromRows,
	stripEmptyRowsFromEnd,
	splitRowsIntoPages,
	cellIsBold,
	getCellDisplayValue,
	filterColumns
}

