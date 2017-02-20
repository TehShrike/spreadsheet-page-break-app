const template = require('./viewSpreadsheet.html')

module.exports = function createView(mediator) {
	return {
		name: 'app.viewSpreadsheet',
		defaultChild: 'teacher',
		route: 'view/:spreadsheetId',
		template,
		resolve: async (data, { spreadsheetId }) => {
			return {
				spreadsheet: await mediator.call('gapi:getSpreadsheet', spreadsheetId)
			}
		}
	}
}
