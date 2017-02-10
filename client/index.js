require('babel-polyfill')

const StateRouter = require('abstract-state-router')
const makeSvelteStateRenderer = require('svelte-state-renderer')
const mannish = require('mannish')
const createView = require('./view')

const mediator = mannish()

const renderer = makeSvelteStateRenderer({
	data: {
		call: mediator.call
	}
})

const context = {
	mediator,
	config: {
		googleApiClientId: '701826345256-37j3kdn4dmn40moje64l7poabn5cg0a2.apps.googleusercontent.com'
	}
}

const stateRouter = StateRouter(renderer, document.getElementById('container'))

mediator.provide('stateGo', stateRouter.go)

createView(mediator).forEach(stateRouter.addState)

const statefulModules = [
	require('./service/googleApi')
]

const launchingAllModules = Promise.all(statefulModules.map(module => module(context)))

launchingAllModules.then(() => {
	stateRouter.evaluateCurrentRoute('app.selectSpreadsheet')
})
