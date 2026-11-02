export const getItem = async (key) => globalThis.localStorage?.getItem(key) ?? null;

export const setItem = async (key, value) => {
  globalThis.localStorage?.setItem(key, value);
};

export const deleteItem = async (key) => {
  globalThis.localStorage?.removeItem(key);
};
