import { generic } from '../../decorators/eacnet.js';
import { Context } from '../../types.js';
import { Serializable, v } from '../../utils/kxml-value.js';
import { mpacks } from '../../datas/ddr.js';
import { PlayerRecordType, UserLoadReq, UserSaveReq } from '../../types/ddr/index.js';
import { UserService } from '../../services/ddr/user.js';

export class User {
  userService: UserService;

  async _usernew(token: string): Promise<Serializable> {
    await this.userService.upsertPlayData({
      _id: token,
      name: '',
      bestClearLevel: 0,
      singleGrade: 0,
      doubleGrade: 0,
      leagueClass: 0,
      records: {
        'COMMON': new Array(64).fill(''),
        'OPTION': new Array(64).fill(''),
        'LAST': new Array(64).fill(''),
        'RIVAL': new Array(64).fill(''),
      },
    })

    return {
      $status: 0,

      result: v.s32(0),
      seq: v.s32(0),
      code: v.s32(0),
      shoparea: v.str('JP-13'),
    };
  }

  emptyData() {
    return {
      $status: 0,
      is_new: v.bool(true),
      is_refid_locked: v.bool(false),
      best_clear_level: v.s8(0),
      eventdata_count_all: v.s16(0),
      grade: {
        single_grade: v.u32(0),
        double_grade: v.u32(0),
      },
      golden_league: {
        league_class: v.s32(0),
      },
      gamesession: v.u64(Date.now()),
      result: v.s32(0),
    };
  }

  async _userload(token: string, data: UserLoadReq): Promise<Serializable> {
    if (data.refid.startsWith('X')) {
      return this.emptyData();
    }

    const playData = await this.userService.findPlayData(token);

    if (!playData) {
      return this.emptyData();
    }

    const musicDatas = await this.userService.findMusicDatas(token);

    return {
      $status: 0,
      is_new: v.bool(false),
      is_refid_locked: v.bool(false),
      best_clear_level: v.s8(playData.bestClearLevel),
      eventdata_count_all: v.s16(0),
      grade: {
        single_grade: v.u32(playData.singleGrade),
        double_grade: v.u32(playData.doubleGrade),
      },
      golden_league: {
        league_class: v.s32(playData.leagueClass),
      },
      gamesession: v.u64(Date.now()),
      music: musicDatas.map(m => ({
        mcode: v.u32(m.mcode),
        note_comp: m.notes.map(n => ({
          note_str: v.str(n.join(',')),
        })),
      })),
      result: v.s32(0),
    };
  }

  async _ghostload(): Promise<Serializable> {
    return {
      $status: 0,
      result: v.s32(0),
    };
  }

  async _usersave(token: string, data: UserSaveReq): Promise<Serializable> {
    const playData = await this.userService.findPlayData(token);

    if (!playData) {
      return {
        $status: 404,
        result: v.s32(1),
      };
    }

    playData.name = data.name;
    playData.records['COMMON'][24] = data.name;

    const updateMusics = data.note.filter(n => n.mcode != 0)

    await Promise.all([
      this.userService.upsertPlayData(playData),
      this.userService.insertPlayRecords(updateMusics.map(m => ({
        player: token,
        mcode: m.mcode,
        noteType: m.notetype,
        playtime: m.endtime,
        playStyle: m.playstyle,
        rank: m.rank,
        clearKind: m.clearkind,
        score: m.score,
        exScore: m.exscore,
        maxCombo: m.maxcombo,
        life: m.life,
        judge: {
          fast: m.fastcount,
          slow: m.slowcount,
          marvelous: m.judge_marvelous,
          perfect: m.judge_perfect,
          great: m.judge_great,
          good: m.judge_good,
          boo: m.judge_boo,
          miss: m.judge_miss,
          ok: m.judge_ok,
          ng: m.judge_ng,
        },
        calorie: m.calorie,
        ghost: m.ghost,
      }))),
      ...updateMusics.map(m => this.userService.updateMusicData(token, m))
    ]);

    return {
      $status: 0,
      result: v.s32(0),
    };
  }

  async _rivalload(): Promise<Serializable> {
    return {
      $status: 0,
      result: v.s32(0),
    };
  }

  async _inheritance(): Promise<Serializable> {
    return {
      $status: 0,
      result: v.s32(0),
    };
  }

  async _arcadeload(): Promise<Serializable> {
    return {
      $status: 0,
      is_acdata_exists: v.bool(false),
      eventload: {
        eventdata_count_all: v.s16(0),
      },
      acdata_gettime: v.u64(Date.now()),
      result: v.s32(0),
    };
  }

  async _linkage_pre_playable(): Promise<Serializable> {
    const now = new Date();

    return {
      $status: 0,
      update_y: v.u16(now.getUTCFullYear()),
      update_m: v.u8(now.getUTCMonth()),
      next_y: v.u16(now.getUTCFullYear() + 1),
      next_m: v.u8(now.getUTCMonth()),
      result: v.s32(0),
    };
  }

  async _mpackload() {
    return {
      $status: 0,
      mpacklist: mpacks,
      result: v.s32(0),
    };
  }

  @generic()
  async usergamedata_advanced(ctx: Context): Promise<Serializable> {
    const data = ctx.body.data as {
      mode: string,
    };

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        playerdata_2: await {
          'usernew': this._usernew,
          'userload': this._userload,
          'ghostload': this._ghostload,
          'usersave': this._usersave,
          'rivalload': this._rivalload,
          'inheritance': this._inheritance,
          'arcadeload': this._arcadeload,
          'mpackload': this._mpackload,
          'linkage_pre_playable': this._linkage_pre_playable,
        }[data.mode].apply(this, [ctx.token, data]),
      },
    };
  }

  convertCsvMask(maskString: string): number[] {
    const mask = BigInt('0x' + maskString);
    const fields = [];
    for (let i = 0; i < 64; i++) {
      if ((mask & (1n << BigInt(i))) == 0n)
        continue;

      fields.push(i);
    }

    return fields;
  }

  @generic()
  async usergamedata_send(ctx: Context): Promise<Serializable> {
    const playerData = await this.userService.findPlayData(ctx.token);

    const records = ((ctx.body.data.record.d instanceof Array ?
      ctx.body.data.record.d : [ctx.body.data.record.d]) as string[])
      .map(v => {
        const columns = atob(v).split(',')
        const mask = this.convertCsvMask(columns[0]);
        const type = columns[1] as PlayerRecordType;
        const fields = columns.slice(3);

        return {
          mask, type, fields,
        }
      });

    for (const record of records) {
      const row = playerData.records[record.type] ?? (new Array<string>(32).fill(''));
      record.mask.forEach((col, i) => {
        row[col] = record.fields[i];
      })
    }

    await this.userService.upsertPlayData(playerData);

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        playerdata_2: {
          $status: 0,
        },
      },
    };
  }

  @generic()
  async usergamedata_recv(ctx: Context): Promise<Serializable> {
    const csv = ctx.body.data.recv_csv as string;
    const loadFields = csv.split(',');

    const result: Serializable[] = [];
    const playData = await this.userService.findPlayData(ctx.token);

    for (let i = 0; i < loadFields.length; i += 2) {
      const mask = this.convertCsvMask(loadFields[i + 1]);
      const type = loadFields[i] as PlayerRecordType;

      if (!(playData && type in playData.records)) {
        result.push(v.str('<NODATA>'));
        continue;
      }

      const row = ['1'];
      mask.forEach((col) => {
        row.push(playData.records[type][col]);
      });
      row.push('');

      result.push(v.str(btoa(row.join(','))));
    }

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        playerdata_2: {
          $status: 0,
          player: {
            record_num: v.u32(loadFields.length),
            record: {
              d: result,
            },
          },
        },
      },
    };
  }
}
