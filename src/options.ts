// StringKeyValueObject is just a simple constrained version of a normal JavaScript object
//   but at least providing some typing rather than just "any"

export interface StringKeyValueObject<V> {
  [opt: string]: V;
}

// unclear the best place to put these 2 "types", so here for ease of use

// This cant be a true Map because there are places internal to the Yeoman Generator that assume a basic object structure,
//    not a map representation
// ex. this.option usage for defaults wouldnt sync up with the same option in a true map

export type OptionsMap = StringKeyValueObject<string>;

// the more general form of answers might be used later - where the values can be boolean or array or string....

export type Answers = StringKeyValueObject<string>;
