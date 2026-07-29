import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _7f12b97e = () => interopDefault(import('..\\pages\\create-candidate.vue' /* webpackChunkName: "pages/create-candidate" */))
const _2210d84c = () => interopDefault(import('..\\pages\\demand.vue' /* webpackChunkName: "pages/demand" */))
const _509913f9 = () => interopDefault(import('..\\pages\\deptcontrol.vue' /* webpackChunkName: "pages/deptcontrol" */))
const _c61fb5be = () => interopDefault(import('..\\pages\\intern.vue' /* webpackChunkName: "pages/intern" */))
const _04940e7e = () => interopDefault(import('..\\pages\\recruiting-report.vue' /* webpackChunkName: "pages/recruiting-report" */))
const _560fa97f = () => interopDefault(import('..\\pages\\resign.vue' /* webpackChunkName: "pages/resign" */))
const _3f9680f2 = () => interopDefault(import('..\\pages\\resign-report.vue' /* webpackChunkName: "pages/resign-report" */))
const _ec3c25a8 = () => interopDefault(import('..\\pages\\template-print\\bqt.vue' /* webpackChunkName: "pages/template-print/bqt" */))
const _711f4b34 = () => interopDefault(import('..\\pages\\template-print\\hires.vue' /* webpackChunkName: "pages/template-print/hires" */))
const _ea6680ce = () => interopDefault(import('..\\pages\\template-print\\resign.vue' /* webpackChunkName: "pages/template-print/resign" */))
const _3fa1b9da = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/aw/hr/recruiting-report/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/create-candidate",
    component: _7f12b97e,
    name: "create-candidate"
  }, {
    path: "/demand",
    component: _2210d84c,
    name: "demand"
  }, {
    path: "/deptcontrol",
    component: _509913f9,
    name: "deptcontrol"
  }, {
    path: "/intern",
    component: _c61fb5be,
    name: "intern"
  }, {
    path: "/recruiting-report",
    component: _04940e7e,
    name: "recruiting-report"
  }, {
    path: "/resign",
    component: _560fa97f,
    name: "resign"
  }, {
    path: "/resign-report",
    component: _3f9680f2,
    name: "resign-report"
  }, {
    path: "/template-print/bqt",
    component: _ec3c25a8,
    name: "template-print-bqt"
  }, {
    path: "/template-print/hires",
    component: _711f4b34,
    name: "template-print-hires"
  }, {
    path: "/template-print/resign",
    component: _ea6680ce,
    name: "template-print-resign"
  }, {
    path: "/",
    component: _3fa1b9da,
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
