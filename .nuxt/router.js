import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _22fbe7a1 = () => interopDefault(import('..\\pages\\candidate-listing.vue' /* webpackChunkName: "pages/candidate-listing" */))
const _29fac04a = () => interopDefault(import('..\\pages\\create-candidate.vue' /* webpackChunkName: "pages/create-candidate" */))
const _699fa8f4 = () => interopDefault(import('..\\pages\\demand.vue' /* webpackChunkName: "pages/demand" */))
const _41141f1f = () => interopDefault(import('..\\pages\\deptcontrol.vue' /* webpackChunkName: "pages/deptcontrol" */))
const _17983a3b = () => interopDefault(import('..\\pages\\intern.vue' /* webpackChunkName: "pages/intern" */))
const _2b87a524 = () => interopDefault(import('..\\pages\\recruiting-report.vue' /* webpackChunkName: "pages/recruiting-report" */))
const _5e9082ce = () => interopDefault(import('..\\pages\\resign.vue' /* webpackChunkName: "pages/resign" */))
const _05094ad0 = () => interopDefault(import('..\\pages\\resign-report.vue' /* webpackChunkName: "pages/resign-report" */))
const _7b6b1b5c = () => interopDefault(import('..\\pages\\template-print\\bqt.vue' /* webpackChunkName: "pages/template-print/bqt" */))
const _f067a3e8 = () => interopDefault(import('..\\pages\\template-print\\hires.vue' /* webpackChunkName: "pages/template-print/hires" */))
const _54293e9a = () => interopDefault(import('..\\pages\\template-print\\resign.vue' /* webpackChunkName: "pages/template-print/resign" */))
const _600302b9 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/aw/hr/recruiting-report/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/candidate-listing",
    component: _22fbe7a1,
    name: "candidate-listing"
  }, {
    path: "/create-candidate",
    component: _29fac04a,
    name: "create-candidate"
  }, {
    path: "/demand",
    component: _699fa8f4,
    name: "demand"
  }, {
    path: "/deptcontrol",
    component: _41141f1f,
    name: "deptcontrol"
  }, {
    path: "/intern",
    component: _17983a3b,
    name: "intern"
  }, {
    path: "/recruiting-report",
    component: _2b87a524,
    name: "recruiting-report"
  }, {
    path: "/resign",
    component: _5e9082ce,
    name: "resign"
  }, {
    path: "/resign-report",
    component: _05094ad0,
    name: "resign-report"
  }, {
    path: "/template-print/bqt",
    component: _7b6b1b5c,
    name: "template-print-bqt"
  }, {
    path: "/template-print/hires",
    component: _f067a3e8,
    name: "template-print-hires"
  }, {
    path: "/template-print/resign",
    component: _54293e9a,
    name: "template-print-resign"
  }, {
    path: "/",
    component: _600302b9,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
