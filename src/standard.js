// emoji, attack, health, name, text, onSummon
const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "☺️", "😊"];
export function standard(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: `Standard ${cost}-${cost}`,
    text: "",
    onSummon: [],
    onDeath: [],
    onEndOfTurn: [],
    onStartOfTurn: [],
    onSpellCast: [],
    onCreatureEntersField: []
  };
}

export const onSummonSummon = {
  ...standard(2),
  emoji: "",
  name: "Summon Dude",
  text: "onSummon: summon a 1/1 creature",
  onSummon: [
    {
      type: "SUMMON_CREATURE",
      unit: standard(1),
      target: { playerId: "SELF" }
    }
  ]
};

export const onSummonHandBuff = {
  ...standard(3),
  emoji: "",
  name: "Hand Buffer",
  text: "onSummon: get +1 to health and attack of all creatures in your hand",
  onSummon: [
    {
      type: "BUFF",
      attack: 1,
      health: 1,
      target: { type: "creature", location: "hand", player: "self" }
    }
  ]
};

export const onSummonBounce = {
  ...standard(1),
  emoji: "",
  name: "Bouncer",
  text: "onSummon: choose a friendly creature to return to your hand",
  onSummon: [
    {
      type: "BOUNCE",
      target: { type: "creature", count: 1, location: "field", player: "self" }
    }
  ]
};
export function threeMaster(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Three Master",
    text: `onSummon: Set all other creatures' Attack and Health to 3`,
    onSummon: [
      {
        type: "CHANGE_ATTACK",
        value: 3,
        target: { type: "creature", location: "field" }
      },
      {
        type: "CHANGE_HEALTH",
        value: 3,
        target: { type: "creature", location: "field" }
      }
    ]
  };
}

export function cardDraw(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Card Drawer",
    text: `onSummon: draw a card`,
    onSummon: [
      {
        type: "DRAW_CARD",
        value: 1,
        target: { player: "self" }
      }
    ]
  };
}

export function damageCreature(cost) {
  const emoji = emojis[cost] || emojis[emojis.length - 1];
  return {
    cost: cost,
    // emoji: emoji,
    attack: cost,
    health: cost,
    type: "creature",
    name: "Creature Damager",
    text: `onSummon: deal 1 damage to three target creatures`,
    onSummon: [
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" }
      },
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" }
      },
      {
        type: "DAMAGE",
        value: 1,
        target: { type: "creature", count: 1, location: "field" }
      }
    ]
  };
}

export const onSummonRandomDamage = {
  ...standard(2),
  name: "Random Creature Damager",
  text: `onSummon: deal 1 random damage to three target creatures`,
  onSummon: [
    {
      type: "DAMAGE",
      value: 1,
      target: { type: "creature", count: 1, location: "field", random: true }
    },
    {
      type: "DAMAGE",
      value: 1,
      target: { type: "creature", count: 1, location: "field", random: true }
    },
    {
      type: "DAMAGE",
      value: 1,
      target: { type: "creature", count: 1, location: "field", random: true }
    }
  ]
};

export function getStandardDeck() {
  return [
    standard(1),
    standard(2),
    standard(3),
    standard(4),
    standard(5),
    standard(6),
    threeMaster(3),
    cardDraw(2),
    damageCreature(4),
    onSummonSummon,
    onSummonHandBuff,
    onSummonBounce,
    onSummonRandomDamage
  ];
}

export function getStandardEmoji() {
  return ["🐒", "🐙", "🐷", "😈", "👾", "🐝", "🌞"];
}
