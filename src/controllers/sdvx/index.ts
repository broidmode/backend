import { Combine } from "../../utils/combine.js";
import { AcRelay } from "./ac-relay.js";
import { UserService } from "../../services/sdvx/user.js";
import { inject, singleton } from "tsyringe";
import { User } from "./user.js";
import { Music } from "./music.js";
import { EacGeneric } from "../eac-generic.js";

@singleton()
export default class extends Combine(AcRelay, User, Music, EacGeneric) {
  constructor(
    @inject(UserService) private readonly userService: UserService,
  ) {
    super();

    this.userService;
  }
}
