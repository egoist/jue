function jue(type, opts, children) { // eslint-disable-line complexity
  opts = opts || {}

  if (type === 'Component') {
    const result = {
      name: 'Root',
      functional: opts.functional
    }
    for (const child of children) {
      switch (child.type) {
        case 'Method':
          result.methods = result.methods || {}
          result.methods[getName(child)] = child.payload
          break
        case 'Computed':
          result.computed = result.computed || {}
          result.computed[getName(child)] = child.payload
          break
        case 'Component':
          result.components = result.components || {}
          result.components[getName(child)] = child.payload
          break
        case 'Watch':
          result.watch = result.watch || {}
          result.watch[getName(child)] = child.payload
          break
        case 'Directives':
          result.directives = result.directives || {}
          result.directives[getName(child)] = child.payload
          break
        case 'Filters':
          result.filters = result.filters || {}
          result.filters[getName(child)] = child.payload
          break
        case 'Data':
        case 'Render':
        case 'Template':
        case 'BeforeCreate':
        case 'Created':
        case 'BeforeMount':
        case 'Mounted':
        case 'BeforeDestroy':
        case 'BeforeUpdate':
        case 'Updated':
        case 'Deactivated':
        case 'Activated':
        case 'Props':
        case 'RenderError':
          result[child.type.charAt(0).toLowerCase() + child.type.slice(1)] = child.payload
          break
        default:
          console.error('Unknown jue component!')
      }
    }
    return result
  }

  return { type, opts, payload: children[0] }
}

function getName(child) {
  return child.opts.name || child.payload.name
}

export default jue
