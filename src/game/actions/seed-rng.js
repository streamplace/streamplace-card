import ssbKeys from "ssb-keys";
import { clientGenerateKey } from "../../client-actions";

export const SEED_RNG = "SEED_RNG";
export const seedRngAction = action => {
  return action;
};

export const SEED_RNG_ENCRYPT = "SEED_RNG_ENCRYPT";
export const seedRngEncryptAction = action => async (dispatch, getState) => {
  const { keys } = await dispatch(clientGenerateKey());
  // Math.random isn't the most secure probably
  const randoSecret = ssbKeys.hash(`${Math.random()}`);
  const boxed = ssbKeys.box(randoSecret, [keys]);
  dispatch({
    ...action,
    id: keys.id,
    box: boxed
  });
};

export const SEED_RNG_DECRYPT = "SEED_RNG_DECRYPT";
export const seedRngDecryptAction = action => async (dispatch, getState) => {
  const state = getState();
  const mySeed = state.game.randoSeeds[action._sender];
  const privateKey = state.secret[mySeed.id].private;
  dispatch({
    ...action,
    private: privateKey
  });
};

// these actions should all happen in lexical order rather than playerOrder because they're used to // seed the RNG prior to playerOrder existing
export const seedRngReducer = (state, action) => {
  if (action.type === SEED_RNG) {
    const orderedPlayers = Object.keys(state.game.players).sort();
    return {
      ...state,
      game: {
        ...state.game,
        nextActions: [
          {
            playerId: orderedPlayers[0],
            action: {
              type: SEED_RNG_ENCRYPT
            }
          },
          ...state.game.nextActions
        ]
      }
    };
  }

  if (action.type === SEED_RNG_ENCRYPT) {
    const orderedPlayers = Object.keys(state.game.players).sort();
    state = {
      ...state,
      game: {
        ...state.game,
        randoSeeds: {
          ...state.game.randoSeeds,
          [action._sender]: {
            secret: true,
            id: action.id,
            box: action.box,
            playerId: action._sender
          }
        }
      }
    };
    // if we're done, do all the decrypts
    const seedCount = Object.keys(state.game.randoSeeds).length;
    if (seedCount === orderedPlayers.length) {
      return {
        ...state,
        game: {
          ...state.game,
          nextActions: [
            ...orderedPlayers.map(playerId => ({
              playerId: playerId,
              action: {
                type: SEED_RNG_DECRYPT
              }
            })),
            ...state.game.nextActions
          ]
        }
      };
    }
    // otherwise do the next encrypt
    else {
      return {
        ...state,
        game: {
          ...state.game,
          nextActions: [
            {
              playerId: orderedPlayers[seedCount],
              action: {
                type: SEED_RNG_ENCRYPT
              }
            },
            ...state.game.nextActions
          ]
        }
      };
    }
  }

  if (action.type === SEED_RNG_DECRYPT) {
    const orderedPlayers = Object.keys(state.game.players).sort();
    const randoSeed = state.game.randoSeeds[action._sender];
    let newSecret = state.secret;
    if (state.secret[randoSeed.id]) {
      newSecret = { ...state.secret };
      delete newSecret[randoSeed.id];
    }
    state = {
      ...state,
      secret: newSecret,
      game: {
        ...state.game,
        randoSeeds: {
          ...state.game.randoSeeds,
          [action._sender]: ssbKeys.unbox(
            state.game.randoSeeds[action._sender].box,
            { private: action.private }
          )
        }
      }
    };
    // if we're done, clear out randoSeeds
    if (
      !Object.values(state.game.randoSeeds).every(
        val => typeof val === "string"
      )
    ) {
      return state;
    }
    const finalSeed = ssbKeys.hash(
      orderedPlayers.map(playerId => state.game.randoSeeds[playerId]).concat("")
    );
    return {
      ...state,
      game: {
        ...state.game,
        randoSeeds: {},
        randoSeed: finalSeed
      }
    };
  }

  return state;
};