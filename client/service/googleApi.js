const EventEmitter = require('eventemitter')
const waterfall = require('p-waterfall')

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

	const initializeFn = () => initializationPromise

	const signedInWatcher = createSignedInWatcher(googleApi)

	return {
		signIn: () => waterfall([
			initializeFn,
			async () => {
				googleApi.auth2.getAuthInstance().signIn()

				await signedInWatcher.awaitSignIn()
			}
		]),
		isSignedIn: () => waterfall([ initializeFn, signedInWatcher.isSignedIn ])
	}
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
