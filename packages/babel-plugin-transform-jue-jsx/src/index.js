const esutils = require('esutils')
const groupProps = require('./group-props')

function isJueTagName(name) {
  return [
    'Component',
    'Data',
    'Method',
    'Render',
    'Template',
    'Computed',
    'Created',
    'Updated',
    'Mounted',
    'BeforeDestroy',
    'BeforeCreate',
    'BeforeMount',
    'BeforeUpdate',
    'Deactivated',
    'Activated'
  ].indexOf(name) > -1
}

module.exports = function (babel) {
  const t = babel.types

  return {
    inherits: require('babel-plugin-syntax-jsx'),
    visitor: {
      JSXNamespacedName(path) {
        throw path.buildCodeFrameError(
          'Namespaced tags/attributes are not supported. JSX is not XML.\n' +
          'For attributes like xlink:href, use xlinkHref instead.'
        )
      },
      JSXElement: {
        exit(path, file) {
          // Turn tag into createElement call
          const callExpr = buildElementCall(path.get('openingElement'), file)
          // Add children array as 3rd arg
          callExpr.arguments.push(t.arrayExpression(path.node.children))
          if (callExpr.arguments.length >= 3) {
            callExpr._prettyCall = true
          }
          path.replaceWith(t.inherits(callExpr, path.node))
        }
      },
      'Program'(path) {
        path.traverse({
          'ObjectMethod|ClassMethod|FunctionExpression'(path) {
            const params = path.get('params')
            // Do nothing if there is (h) param
            if (params.length > 0 && params[0].node.name === 'h') {
              return
            }
            // Do nothing if there is no JSX inside
            const jsxChecker = {
              hasJsx: false
            }
            path.traverse({
              JSXElement() {
                this.hasJsx = true
              }
            }, jsxChecker)
            if (!jsxChecker.hasJsx) {
              return
            }
            // Prepend const h = this.$createElement otherwise
            path.get('body').unshiftContainer('body', t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier('h'),
                t.memberExpression(
                  t.thisExpression(),
                  t.identifier('$createElement')
                )
              )
            ]))
          }
        })
      }
    }
  }

  function buildElementCall(path, file) {
    path.parent.children = t.react.buildChildren(path.parent)
    const tagExpr = convertJSXIdentifier(path.node.name, path.node)
    const args = []

    let tagName
    if (t.isIdentifier(tagExpr)) {
      tagName = tagExpr.name
    } else if (t.isLiteral(tagExpr)) {
      tagName = tagExpr.value
    }

    const jueTagName = isJueTagName(tagName)

    if (t.react.isCompatTag(tagName) || jueTagName) {
      args.push(t.stringLiteral(tagName))
    } else {
      args.push(tagExpr)
    }

    let attribs = path.node.attributes
    if (attribs.length > 0) {
      attribs = buildOpeningElementAttributes(attribs, file)
    } else {
      attribs = t.nullLiteral()
    }
    args.push(attribs)

    return t.callExpression(t.identifier(jueTagName ? 'jue' : 'h'), args)
  }

  function convertJSXIdentifier(node, parent) {
    if (t.isJSXIdentifier(node)) {
      if (node.name === 'this' && t.isReferenced(node, parent)) {
        return t.thisExpression()
      } else if (esutils.keyword.isIdentifierNameES6(node.name)) {
        node.type = 'Identifier'
      } else {
        return t.stringLiteral(node.name)
      }
    } else if (t.isJSXMemberExpression(node)) {
      return t.memberExpression(
        convertJSXIdentifier(node.object, node),
        convertJSXIdentifier(node.property, node)
      )
    }
    return node
  }

  /**
   * The logic for this is quite terse. It's because we need to
   * support spread elements. We loop over all attributes,
   * breaking on spreads, we then push a new object containing
   * all prior attributes to an array for later processing.
   */

  function buildOpeningElementAttributes(attribs, file) {
    let _props = []
    let objs = []

    function pushProps() {
      if (_props.length === 0) return
      objs.push(t.objectExpression(_props))
      _props = []
    }

    while (attribs.length) {
      const prop = attribs.shift()
      if (t.isJSXSpreadAttribute(prop)) {
        pushProps()
        prop.argument._isSpread = true
        objs.push(prop.argument)
      } else {
        _props.push(convertAttribute(prop))
      }
    }

    pushProps()

    objs = objs.map(o => {
      return o._isSpread ? o : groupProps(o.properties, t)
    })

    if (objs.length === 1) {
      // Only one object
      attribs = objs[0]
    } else if (objs.length > 0) {
      // Add prop merging helper
      const helper = file.addImport('babel-helper-vue-jsx-merge-props', 'default', '_mergeJSXProps')
      // Spread it
      attribs = t.callExpression(
        helper,
        [t.arrayExpression(objs)]
      )
    }
    return attribs
  }

  function convertAttribute(node) {
    const value = convertAttributeValue(node.value || t.booleanLiteral(true))
    if (t.isStringLiteral(value) && !t.isJSXExpressionContainer(node.value)) {
      value.value = value.value.replace(/\n\s+/g, ' ')
    }
    if (t.isValidIdentifier(node.name.name)) {
      node.name.type = 'Identifier'
    } else {
      node.name = t.stringLiteral(node.name.name)
    }
    return t.inherits(t.objectProperty(node.name, value), node)
  }

  function convertAttributeValue(node) {
    if (t.isJSXExpressionContainer(node)) {
      return node.expression
    }
    return node
  }
}
