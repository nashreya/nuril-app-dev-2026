const users = [
  {
    id: 1,
    email: "nazz@test.com",
    username: "nazz",
    password: "12345"
  },
  {
    id: 2,
    email: "shiye@test.com",
    username: "shiye",
    password: "shiye123"
  }
];

let lastId = users.length;

function nextId() {
  lastId += 1;
  return lastId;
}

module.exports = { users, nextId };
