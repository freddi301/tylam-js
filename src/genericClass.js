const getConstructorChain = require('./getConstructorChain')

const genericClass = klass => {
  const classMap = new Map()
  function add(parameter){
    const existing = classMap.get(parameter)
    if (existing) return existing
    const newClass = klass(parameter, add(getConstructorChain(parameter)[1]))
    classMap.set(parameter, newClass)
    return newClass
  }
  classMap.set(Object, klass(Object, Object))
  return function(parameter){
    getConstructorChain(parameter).reverse().map(add)
    return add(parameter)
  }
}

module.exports = genericClass
