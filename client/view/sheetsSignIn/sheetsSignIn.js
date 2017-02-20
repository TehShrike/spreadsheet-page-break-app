const template = require('./sheetsSignIn.html')

module.exports = function createView(mediator) {
	return {
		name: 'sheetsSignIn',
		route: 'sheets-sign-in',
		template
	}
}
