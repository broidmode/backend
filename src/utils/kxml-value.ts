export type ValueTypes = 's8' |
  'u8' |
  's16' |
  'u16' |
  's32' |
  'u32' |
  's64' |
  'u64' |
  'float' |
  'double' |
  'b' | 'bool' |
  'bin' | 'binary' |
  'ip4' |
  'str' | 'string' |
  'time';

type AttributeProperty<T> = {
  [K in keyof T as K extends string ? `$${K}` : never]: T[K]
}

export type KValueG<T extends ValueTypes, VT = unknown> = {
  $__type: T;
  __value: VT | VT[];
} & AttributeProperty<{
  [key: string]: string | number;
}>;

export type KS8 = KValueG<'s8', number>;
export type KU8 = KValueG<'u8', number>;
export type KS16 = KValueG<'s16', number>;
export type KU16 = KValueG<'u16', number>;
export type KS32 = KValueG<'s32', number>;
export type KU32 = KValueG<'u32', number>;
export type KS64 = KValueG<'s64', number>;
export type KU64 = KValueG<'u64', number>;
export type KFloat = KValueG<'float', number>;
export type KDouble = KValueG<'double', number>;
export type KBoolean = KValueG<'bool', boolean> | KValueG<'b', boolean>;
export type KBinary = KValueG<'bin', Buffer> | KValueG<'binary', Buffer>;
export type KString = KValueG<'str', string> | KValueG<'string', string>;
export type KIPv4 = KValueG<'ip4', string>;
export type KTime = KValueG<'time', Date | number>;
export type KValue = KS8 | KU8 | KS16 | KU16 | KS32 | KS64 | KU64 | KFloat | KDouble | KBoolean | KBinary | KString | KIPv4 | KTime;

export type Serializable = {
  [key: string]: KValue | Serializable | Serializable[]
} | AttributeProperty<{
  [key: string]: string | number;
}>;

function vg<T extends ValueTypes, VT>(type: T) {
  return (value: VT | VT[], attrs?: object): KValueG<T, VT> => {
    const result = {
      $__type: type,
      __value: value,
    };

    if (attrs) {
      for (const key in attrs) {
        result['$' + key] = attrs[key];
      }
    }

    return result;
  };
}

export const v = {
  s8: vg<'s8', number>('s8'),
  u8: vg<'u8', number>('u8'),
  s16: vg<'s16', number>('s16'),
  u16: vg<'u16', number>('u16'),
  s32: vg<'s32', number>('s32'),
  u32: vg<'u32', number>('u32'),
  s64: vg<'s64', bigint | number>('s64'),
  u64: vg<'u64', bigint | number>('u64'),
  float: vg<'float', number>('float'),
  double: vg<'double', number>('double'),
  b: vg<'b', boolean>('b'),
  bool: vg<'bool', boolean>('bool'),
  bin: vg<'bin', Buffer>('bin'),
  binary: vg<'binary', Buffer>('binary'),
  ip4: vg<'ip4', string>('ip4'),
  str: vg<'str', string>('str'),
  string: vg<'string', string>('string'),
  time: vg<'time', Date | number>('time'),
}
