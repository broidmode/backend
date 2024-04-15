import { v } from "../../utils/kxml-value.js";
import { Game } from "./game.js";
import { Service } from "./service.js";
import { User } from "./user.js";
import data from './data.json' with { type: "json" };
import { inject, singleton } from "tsyringe";
import { UserService } from "../../services/p2d/user.js";
import { Music } from "./music.js";

function Combine(...modules: ({ new(): any })[]) {
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

@singleton()
export default class extends Combine(Service, User, Game, Music) {
  constructor(
    @inject(UserService) private readonly userService: UserService,
  ) {
    super();

    this.userService;
  }
}

export const ITEM_LIST = data.items.map(id => ({
  item_id: v.str(id),
  not_free_count: v.s32(1),
  free_count: v.s32(0),
}));

export const MUSIC_LIST = [
  ...data.musics.map(m => ({
    music_id: v.s32(m.id),
    kind: v.s32(1),
    note_bit: v.s32(m.noteBit),
    music_pack_item_id: v.str('')
  })),
  ...data.omni_musics.map(m => ({
    music_id: v.s32(m.id),
    kind: v.s32(2),
    note_bit: v.s32(0),
    music_pack_item_id: v.str('')
  })),
];
