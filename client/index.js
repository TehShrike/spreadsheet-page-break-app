require('babel-polyfill')

const StateRouter = require('abstract-state-router')
const makeSvelteStateRenderer = require('svelte-state-renderer')
const mannish = require('mannish')
const views = require('./globbed-views')

const mediator = mannish()

const renderer = makeSvelteStateRenderer({
	data: {
		call: mediator.call
	}
})

const stateRouter = StateRouter(renderer, document.getElementById('container'))

mediator.provide('stateGo', stateRouter.go)

views.map(createView => createView(mediator)).forEach(stateRouter.addState)

const statefulModules = require('./globbed-services')

const moduleContext = {
	mediator,
	config: {
		googleApiClientId: '701826345256-37j3kdn4dmn40moje64l7poabn5cg0a2.apps.googleusercontent.com'
	}
}

const moduleInitializationPromises = statefulModules.map(module => module(moduleContext))
Promise.all(moduleInitializationPromises).then(() => {
	stateRouter.evaluateCurrentRoute('app.selectSpreadsheet')
})
