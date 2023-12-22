const User = require('../models/user');
 
exports.createUser = (req, res, next) => {
  // get post's title and content from the request
  const email = req.body.email;
  const password = req.body.password;
  // create a post with a dynamic Id with the current date
  // return a confirmation message with the created post object
  // create a new Post instance
  const user = new User({
    email: email,
    password: password
  });

  user
  .save()
  .then(userSaved => {
    res.status(201).json({
      status: 'success',
      message: 'User created successfully!',
      post: userSaved
    });
  })
  .catch(err => res.status(500).json({err}));
}