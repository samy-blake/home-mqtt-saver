import { Level } from "level";
import { join } from "path";

let db = {
  livingroom: null,
  officeroom: null,
  bedroom: null,
};

export const DB = {
  _exists: room => Object.prototype.hasOwnProperty.call(db, room),
  init: () => {
    for (const room in db) {
      if (Object.prototype.hasOwnProperty.call(db, room)) {
        db[room] = new Level(join(import.meta.dirname, "../db", room), {
          valueEncoding: "json",
        });
      }
    }
  },

  add: async (value, room) => {
    if (!DB._exists(room)) return console.log('room', room, 'not exists');
    await db[room].put(Date.now(), value);
  },

  getOne: async (date, room) => {
    if (!DB._exists(room)) return console.log('room', room, 'not exists');
    return await db[room].get(date);
  },
  getLast: async (room) => {
    if (!DB._exists(room)) return console.log('room', room, 'not exists');
    const lastKey = (await db[room].keys({ limit: 1, reverse: true }).all()).reduce(
      (v) => v
    );
    const data = await DB.getOne(Number.parseInt(lastKey), room);
    data.time = lastKey;
    return data;
  },
  getMultiple: async (room, minDate = false, maxDate = false) => {
    if (!DB._exists(room)) return console.log('room', room, 'not exists');
    const data = [];
    const opts = {};
    if (minDate) opts.gt = minDate;
    if (maxDate) opts.lt = maxDate;

    for await (let [key, value] of db[room].iterator(opts)) {
      data.push({
        ...value,
        time: key,
      });
    }
    return data;
  },
  removeAll: async (room) => {
    if (!DB._exists(room)) return console.log('room', room, 'not exists');
    await db[room].clear();
  },
};