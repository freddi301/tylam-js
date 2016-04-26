const throwe = e => {
  throw new Error(JSON.stringify(e, ((k,v)=>v instanceof Function ? v.toString() : v), 2))
}

module.exports = throwe
