export interface StringKeyValueObject<V> {
  [opt: string]: V;
}

export type OptionsMap = StringKeyValueObject<string>;
