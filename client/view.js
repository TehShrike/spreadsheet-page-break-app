module.exports = function createView(mediator) {
	return [{
		name: 'sheetsSignIn',
		route: 'sheets-sign-in',
		template: require('./component/sheetsSignIn.html')
	}, {
		name: 'app',
		route: 'app',
		template: require('./component/app.html'),
		resolve: async (data, parameters) => {
			const signedIn = await mediator.call('gapi:isSignedIn')

			if (signedIn) {
				return {}
			} else {
				return Promise.reject({
					redirectTo: {
						name: 'sheetsSignIn'
					}
				})
			}
		}
	}, {
		name: 'app.selectSpreadsheet',
		route: 'select-spreadsheet',
		template: require('./component/selectSpreadsheet.html')
	}, {
		name: 'app.viewSpreadsheet',
		defaultChild: 'teacher',
		route: 'view/:spreadsheetId',
		template: require('./component/viewSpreadsheet.html'),
		resolve: async (data, { spreadsheetId }) => {
			return {
				spreadsheet: await mediator.call('gapi:getSpreadsheet', spreadsheetId)
			}
		}
	}, {
		name: 'app.viewSpreadsheet.teacher',
		route: 'teacher',
		template: require('./component/teacher.html')
	}]
}
