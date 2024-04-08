import { Service } from "./service.js";

function Combine(...modules: ({ new(): any })[]) {
  class Modules {
    constructor() {
      modules.forEach(v => Object.assign(this, new v()));
    }
  }

  modules.forEach(v => {
    Object.getOwnPropertyNames(v.prototype)
      .filter(p => p != 'constructor')
      .forEach(p => Modules.prototype[p] = v.prototype[p])
  });

  return Modules;
}

export default class extends Combine(Service) {

}
