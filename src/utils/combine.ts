export function Combine(...modules: ({ new(): any })[]) {
  class Modules {
    constructor() {
      modules.forEach(v => Object.assign(this, new v()));
    }
  }

  modules.forEach(v => {
    const descriptors = Object.getOwnPropertyDescriptors(v.prototype);

    for (const name in descriptors) {
      if (name === 'constructor')
        continue;

      const descriptor = descriptors[name];
      Object.defineProperty(Modules.prototype, name, descriptor);
    }
  });

  return Modules;
}
