const knex = require('../index');
const bcrypt = require('bcrypt');

const User = {};

/*
  ==============================
    Find
  ==============================
*/

User.findUserByName = username => (
  knex('users')
    .where({ username })
    .then(data => data)
    .catch((err) => { console.log(err); })
);

User.findUserByEmail = email => (
  knex('users').where({ email }).then()
);

// the info object should have
// { idType: 'facebook_id | google_id', id: 'id', name: 'name', img: 'url | undefined' }
// returns a promise
User.insertOAuth = (info) => {
  const row = { name: info.name };
  if (info.type === 'google') {
    row.google_id = info.id;
  }

  if (info.img) {
    row.img = info.img;
  }
  row.email = info.email;
  row.city = info.city;
  row.state = info.state;
  row.zip_code = info.zip;

  return knex('users').returning('id').insert(row).then();
};

User.sendInvite = inviteObj => (
  knex('invitations').insert(inviteObj)
    .then(() => console.log('invitation inserted'))
);

User.removeInvites = removeObj => (
  knex('invitations').where({ event_id: removeObj.event_id })
    .then((data) => {
      data.forEach((invite) => {
        console.log(invite);
        if (invite.chef_id !== removeObj.chef_id) {
          knex('invitations').where('id', invite.id).del()
            .then(() => console.log('deleted invite'));
        }
      });
    })
);

User.getChefInvites = id => (
  knex('invitations').where('chef_id', id)
);

User.getClientInvites = id => (
  knex('invitations').where('user_id', id)
);

User.findChefs = () => (
  knex('users').where('is_chef', true)
);

User.findUserById = id => (
  knex('users').where('id', id).select('is_chef', 'street_name', 'city', 'state', 'zip_code', 'name', 'phone', 'cuisine', 'email', 'id', 'rate', 'bio', 'username', 'twitter', 'instagram', 'facebook', 'last_prompted').then()
);

User.findCuisinesById = id => (
  knex('users_cuisines').where('chef_id', id).select('cuisine', 'custom_description').then()
);

/*
  ==============================
    Insert/Update/Delete
  ==============================
*/

User.insertMenuItem = menuObj => (
  knex('menu').insert(menuObj)
    .then(() => console.log('Inserted menu item'))
);

User.editMenuItem = (menuObj) => {
  console.log('Database: ', menuObj);
  return knex('menu').where('id', menuObj.id).update({
    menu_name: menuObj.menu_name,
    description: menuObj.description,
    cuisine_type: menuObj.type,
    pic: menuObj.pic,
  });
};

User.deleteMenuItem = id => (
  knex('menu').where('id', id.id).del()
);

User.getMenuItems = id => (
  knex('menu').where('chef_id', id)
);

User.insertCuisineById = (userObj) => {
  const { id, cuisine, description, userCuisines } = userObj;
  return knex('users_cuisines').insert({
    chef_id: id,
    cuisine,
    custom_description: description,
  })
    .then(() => knex('users').where({ id }).update({ cuisine: userCuisines }))
    .then((insertResult) => {
      console.log('cuisine sucessfully inserted');
      return insertResult;
    })
    .catch((err) => { console.log(err); });
};

User.update = userObj => (
  knex('users').where('id', userObj.id).update({ google_id: userObj.google_id }).then()
);

User.deleteCuisineById = (userObj) => {
  const { id, cuisine } = userObj;
  return knex('users_cuisines')
    .where({ cuisine })
    .andWhere({ chef_id: id })
    .del();
};

User.insertUser = (username, password, email, accType) => {
  let isAChef = false;

  if (accType === 'chef') isAChef = true;
  return bcrypt.hash(password, 10)
    .then(hash => (
      knex('users').insert({
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
    .then(() => User.findUserByName(username))
    .then(data => ({
      userId: data[0].id,
      isChef: data[0].is_chef,
      username: data[0].username,
    }))
    .catch((err) => { console.log(err); });
};

User.insertContactInfo = params => (
  knex('users').where('id', params.id).update(params).then()
);

User.updateCuisineSelection = (id, cuisine) => knex('users')
  .where('id', id)
  .update({ cuisine });

User.updateUserDataByField = (id, field, updatedValue) => knex('users')
  .where('id', id)
  .update({ [field]: updatedValue });

User.updateChefRate = (id, rate) => knex('users')
  .where('id', id)
  .update({ rate });

// This function accepts an object with eventID(number),
// chefId(number), and rating(number 1-5) to update the
// rating of the chef who provided their services for the event

User.updateChefRating = eventObj => (
  knex('users')
    .where('id', eventObj.chefId)
    .then((results) => {
      const currentRating = results.rating;
      // if the chef is not previously rated
      if (currentRating === undefined) {
        return knex('users')
          .where('id', eventObj.chefId)
          .update({ rating: `[${eventObj.rating}, 1]` })
          .catch((err) => {
            console.log(err);
          });
      }
      const arrRating = JSON.parse(currentRating);
      const { currSum, currCount } = arrRating;
      return knex('users')
        .where('id', eventObj.chefId)
        .update({ rating: `[${currSum + eventObj.rating}, ${currCount + 1}]` })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    })
);

/*
  ==============================
    Authentication
  ==============================
*/

User.getAndVerifyUser = (username, password) => {
  let userId;
  let isChef;
  return User.findUserByName(username)
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
