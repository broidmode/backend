import { v } from "../../utils/kxml-value.js";
import { Game } from "./game.js";
import { Service } from "./service.js";
import { User } from "./user.js";
import { inject, singleton } from "tsyringe";
import { UserService } from "../../services/p2d/user.js";
import { Music } from "./music.js";
import { Combine } from "../../utils/combine.js";
import * as data from '../../datas/p2d.js'

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

