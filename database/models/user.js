const db = require('../index');
const bcrypt = require('bcrypt');

const User = {};

User.findUserById = username => (
  db.knex('users')
    .where({ username })
    .then(data => data)
    .catch((err) => { console.log(err); })
);

User.insertUser = (username, password, email, accType) => {
  let isAChef = false;
  if (accType === 'chef') isAChef = true;
  return bcrypt.hash(password, 10)
    .then(hash => (
      db.knex('users').insert({
        username,
        password: hash,
        email,
        is_chef: isAChef,
      })
    ))
    .then((insertResult) => {
      console.log('user sucessfully inserted');
      return insertResult;
    })
    .then(() => User.findUserById(username))
    .then(data => ({
      userId: data[0].id,
      isChef: data[0].is_chef,
      username: data[0].username,
    }))
    .catch((err) => { console.log(err); });
};

User.getAndVerifyUser = (username, password) => {
  let userId;
  let isChef;
  return User.findUserById(username)
    .then((results) => {
      userId = results[0].id;
      isChef = results[0].is_chef;
      return bcrypt.compare(password, results[0].password);
    })
    .then(result => (result ? ({
      userId,
      isChef,
      username,
    }) : null))
    .catch((err) => { console.log(err); });
};

module.exports = User;
