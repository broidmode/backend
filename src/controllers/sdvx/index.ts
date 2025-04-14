import { Combine } from "../../utils/combine.js";
import { AcRelay } from "./ac-relay.js";
import { UserService } from "../../services/sdvx/user.js";
import { inject, singleton } from "tsyringe";
import { EacGeneric } from "../eac-generic.js";
import { generic } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import { requestEa3Typed } from '../../utils/ea3.js';
import { tokenToCardNumber, tokenToSnsId } from "../../utils/laochan-id.js";

import * as data from '../../datas/sdvx.js';

export const SDVX_AC_MODEL = 'KFC:A:B:C:20250414';

@singleton()
export default class extends Combine(AcRelay, EacGeneric) {
  constructor(
    @inject(UserService) private readonly userService: UserService,
  ) {
    super();

    this.userService;
  }

  @generic()
  async getItemList(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        item_num: v.s32(data.itemList.length),
        item: data.itemList.map(id => ({
          item_id: v.str(id),
          not_free_count: v.s32(1),
          free_count: v.s32(0),
        })),
      }
    };
  }

  @generic()
  async getUserIDs(ctx: Context): Promise<Serializable> {
    const card = tokenToCardNumber(ctx.token);

    const { cardmng: inquire } = await requestEa3Typed<{
      cardmng: {
        status: string;
        dataid: string;
        refid: string;
      }
    }>({
      module: 'cardmng',
      method: 'inquire',
      request: {
        $cardtype: '4',
        $update: '0'
      }
    }, SDVX_AC_MODEL, ctx.token);

    if (inquire.status == '0') {
      return {
        status: v.s32(0),
        error_code: v.s32(0),
        response: {
          card_num: v.str(card),
          ref_id: v.str(inquire.refid),
          data_id: v.str(inquire.dataid),
          sns_id: v.str(tokenToSnsId(ctx.token)),
        },
      };
    }

    const { cardmng: getrefid } = await requestEa3Typed<{
      cardmng: {
        status: string;
        dataid: string;
        refid: string;
      }
    }>({
      module: 'cardmng',
      method: 'getrefid',
      request: {
        // TODO: use hash from token instead of 0000?
        $passwd: '0000',
      }
    }, SDVX_AC_MODEL, ctx.token);

    if (getrefid.status !== '0') {
      return {
        status: v.s32(+getrefid.status),
        error_code: v.s32(-1),
      }
    }

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        card_num: v.str(card),
        ref_id: v.str(getrefid.refid),
        data_id: v.str(getrefid.dataid),
        sns_id: v.str(tokenToSnsId(ctx.token)),
      },
    };
  }
}
