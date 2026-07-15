import { AdminRouteWithChildren } from './src/routeTree.gen.ts'
const children = AdminRouteWithChildren.options.children || {}
console.log('children keys', Object.keys(children))
for (const [key, route] of Object.entries(children)) {
  console.log('child', key, route.options?.path, route.options?.id, route.options?.fullPath)
}
