const template = require('./selectSpreadsheet.html')

module.exports = function createView(mediator) {
	return {
		name: 'app.selectSpreadsheet',
		route: 'select-spreadsheet',
		template
	}
}
