// Node has no browser localStorage, so this is a tiny file-backed implementation of the same
// API (getItem / setItem / removeItem). Values are strings, exactly like the browser version.
// The file is loaded once at startup and rewritten after every setItem/removeItem.
const fs = require("fs");
const path = require("path");

class FileLocalStorage {
  constructor(file) {
    this.file = file;
    this.data = {};
    try {
      this.data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      this.data = {}; // first run, or unreadable file: start empty
    }
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
  }

  setItem(key, value) {
    this.data[key] = String(value);
    this._flush();
  }

  removeItem(key) {
    delete this.data[key];
    this._flush();
  }

  _flush() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = this.file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file); // atomic swap so a crash can't leave half a file
  }
}

module.exports = new FileLocalStorage(path.join(__dirname, "..", "..", "data", "localStorage.json"));
