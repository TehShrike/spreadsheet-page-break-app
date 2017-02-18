const EventEmitter = require('eventemitter')

const DISCOVERY_DOCS = [ 'https://sheets.googleapis.com/$discovery/rest?version=v4' ]
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'

module.exports = async function googleApiWrapper({ config, mediator }) {
	const googleApi = gapi // eslint-disable-line no-undef

	const internalApi = await createGoogleApiWrapper(googleApi, config.googleApiClientId)

	Object.keys(internalApi).forEach(functionName => {
		const fn = internalApi[functionName]

		mediator.provide(`gapi:${functionName}`, fn)
	})
}

async function createGoogleApiWrapper(googleApi, clientId) {
	const initializationPromise = await initializeGoogleApi(googleApi, clientId)

	const signedInWatcher = createSignedInWatcher(googleApi)

	function makeAllFunctionsAwaitOnInitialization(mapOfFunctions) {
		const awaitingFunctions = {}

		Object.keys(mapOfFunctions).forEach(name => {
			const originalFunction = mapOfFunctions[name]
			awaitingFunctions[name] = async function(...args) {
				// if this is an arrow function, the ...args below doesn't work 0_o
				await initializationPromise

				return originalFunction(...args)
			}
		})

		return awaitingFunctions
	}

	return makeAllFunctionsAwaitOnInitialization({
		async signIn() {
			googleApi.auth2.getAuthInstance().signIn()

			await signedInWatcher.awaitSignIn()
		},
		async isSignedIn() {
			return signedInWatcher.isSignedIn()
		},
		async getSpreadsheet(spreadsheetId) {
			return googleApi.client.sheets.spreadsheets.get({
				spreadsheetId,
				includeGridData: true
			}).then(response => response.result)
		}
	})
}

async function initializeGoogleApi(googleApi, clientId) {
	await gapiAwaitLoadClient(googleApi)

	await googleApi.client.init({
		discoveryDocs: DISCOVERY_DOCS,
		clientId: clientId,
		scope: SCOPES
	})
}

function createSignedInWatcher(googleApi) {
	const emitter = new EventEmitter()
	let signedIn = gapiIsSignedIn(googleApi)
	console.log('signed in state initialized to', signedIn)

	googleApi.auth2.getAuthInstance().isSignedIn.listen(newSignedInState => {
		signedIn = newSignedInState

		console.log('signed in state is now', newSignedInState)

		if (newSignedInState) {
			emitter.emit('signed in')
		} else {
			emitter.emit('signed out')
		}
	})

	return {
		awaitSignIn() {
			if (signedIn) {
				return Promise.resolve()
			} else {
				return new Promise(resolve => emitter.once('signed in', resolve))
			}
		},
		isSignedIn() {
			return signedIn
		}
	}
}

function gapiAwaitLoadClient(googleApi) {
	return new Promise(resolve => googleApi.load('client:auth2', resolve))
}

function gapiIsSignedIn(googleApi) {
	return googleApi.auth2.getAuthInstance().isSignedIn.get()
}
