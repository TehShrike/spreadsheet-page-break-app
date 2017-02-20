const template = require('./teacher.html')

module.exports = function createView(mediator) {
	return {
		name: 'app.viewSpreadsheet.teacher',
		route: 'teacher',
		template
	}
}
