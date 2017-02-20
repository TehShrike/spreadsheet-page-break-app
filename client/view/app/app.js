const template = require('./app.html')

module.exports = function createView(mediator) {
	return {
		name: 'app',
		route: 'app',
		template,
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
	}
}
