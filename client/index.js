require('babel-polyfill')

const StateRouter = require('abstract-state-router')
const createStateWatcher = require('asr-active-state-watcher')
const makeSvelteStateRenderer = require('svelte-state-renderer')
const mannish = require('mannish')

const mediator = mannish()

const renderer = makeSvelteStateRenderer()

const context = {
	mediator,
	config: {
		googleApiClientId: '701826345256-37j3kdn4dmn40moje64l7poabn5cg0a2.apps.googleusercontent.com'
	}
}

const stateRouter = StateRouter(renderer, document.getElementById('container'))

const stateWatcher = createStateWatcher(stateRouter)
stateWatcher.addDomApiAttachListener(svelteComponent => {
	svelteComponent.on('call', mediator.call)
})

mediator.provide('stateGo', stateRouter.go)

stateRouter.addState({
	name: 'sheetsSignIn',
	route: 'sheets-sign-in',
	template: require('./component/sheetsSignIn.html')
})

stateRouter.addState({
	name: 'app',
	route: 'app',
	template: require('./component/app.html'),
	resolve: async (data, parameters) => {
		const signedIn = await mediator.call('gapi isSignedIn')

		if (signedIn) {
			return Promise.resolve({})
		} else {
			return Promise.reject({
				redirectTo: {
					name: 'sheetsSignIn'
				}
			})
		}
	}
})

stateRouter.addState({
	name: 'app.selectSpreadsheet',
	route: 'select-spreadsheet',
	template: require('./component/selectSpreadsheet.html')
})

const statefulModules = [
	require('./service/googleApi')
]

const launchingAllModules = Promise.all(statefulModules.map(module => module(context)))

launchingAllModules.then(() => {
	stateRouter.evaluateCurrentRoute('app.selectSpreadsheet')
})
