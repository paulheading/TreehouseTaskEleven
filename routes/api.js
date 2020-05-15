
const express  = require('express'),
      bcryptjs = require('bcryptjs'),
      auth     = require('basic-auth'),
      legit    = require('legit'),
      router   = express.Router(),      
      { sequelize, User, Course } = require('../sequelize'),
      { check, validationResult } = require('express-validator');

const titleCheck = check('title')
.exists({ checkNull : true, checkFalsy : true })
.withMessage('Please provide a value for "title"'),

descriptionCheck = check('description')
.exists({ checkNull : true, checkFalsy : true })
.withMessage('Please provide a value for "description"'),

userIdCheck = check('userId')
.exists({ checkNull : true, checkFalsy : true })
.withMessage('Please provide a value for "userId"'),

firstNameCheck = check('firstName')
.exists({ checkNull : true, checkFalsy : true })
.withMessage('Please provide a value for "firstName"'),

lastNameCheck = check('lastName')
.exists({ checkNull : true, checkFalsy : true })
.withMessage('Please provide a value for "lastName"'),

emailAddressCheck = check('emailAddress')
.exists({ checkNull : true, checkFalsy : true })
.withMessage('Please provide a value for "emailAddress"'),

passwordCheck = check('password')
.exists({ checkNull : true, checkFalsy : true })
.withMessage('Please provide a value for "password"');

const authenticateUser = asyncHandler(async (req, res, next) => {

  let message = null;

  // get user credentials from header
  const credentials = auth(req);

  if (credentials) {
    // look for user in database by emailAddress
    // check for match with crudentials
    let user = await User.findAll({ where : { emailAddress : credentials.name }});
    
    user = user[0];

    if (user) {
      // compare database + header passwords with bcrypt
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
          
      if (authenticated) {

        // keep messaging vague
        console.log(`Authentication successful for emailAddress: ${user.emailAddress}`);

        // store the database user info on req so any other middleware can access the info
        req.currentUser = user;
        
      } else {

        // keep messaging vague
        message = `Authentication failure for emailAddress: ${user.emailAddress}`;                

      }

    } else {

      // keep messaging vague
      message = `User not found for emailAddress: ${credentials.emailAddress}`;

    }

  } else {

    // keep messaging vague
    message = 'Auth header not found';

  }

  if (message) {

    console.warn(message);

    // keep messaging vague
    res.status(400).json({ message : 'Access Denied' });
    
  } else {

    next();

  }

});

const isEmailValid = asyncHandler(async (req, res, next) => {

  try {

    // search for result against the legit regex
    const response = await legit(req.body.emailAddress);

    if (response.isValid) {

      // if the response is valid, go ahead
      next();      
      
    } else {

      // if the response isn't valid, send a bad status/message  
      res.status(400).json({ message : "Email address doesn't check out" });

    }

  } catch (error) {

    res.status(400).json(error);

  }

});

/* Handler function to wrap each route. */

function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/* GET api listing. */

router.get('/', asyncHandler(async (req, res) => {

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    res.sendStatus(200);   
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    res.sendStatus(500);
  }

}));

// ********** ********** ********** USER ROUTES ********** ********** **********

router.get('/users', authenticateUser, 
                     asyncHandler(async (req, res) => {
  
  // currentUser is set by authenticateUser
  const user = req.currentUser;

  // returns the currently authenticated user
  res.status(200).json({
    id : user.id,
    firstName : user.firstName,
    lastName : user.lastName,
    emailAddress : user.emailAddress
  });

}));

router.post('/users', firstNameCheck,
                      lastNameCheck,
                      emailAddressCheck,
                      passwordCheck,
                      isEmailValid,
                      asyncHandler(async (req, res) => {

  // check validation for errors
  const errors = validationResult(req);

  // if errors are found
  if (!errors.isEmpty()) {

    const errorMessages = errors.array().map(error => error.msg);

    // return bad request status + display errors
    res.status(400).json({ errors : errorMessages });
    
  } else {

    try {

      const user = req.body;

      // hash the new user's password
      user.password = bcryptjs.hashSync(user.password);

      await User.create(user);

      // return no content
      res.header('Location','/').sendStatus(201);
  
    } catch (error) {
  
      if (error.name === "SequelizeValidationError") {
  
        res.status(400).json({ errors : error.errors });
  
      } else {
  
        throw error;
  
      }
  
    }

  }

}));

// ********** ********** ********** COURSE ROUTES ********** ********** **********

router.get('/courses', asyncHandler(async (req, res) => {

  // find all courses in database
  const courses = await Course.findAll({
    attributes : [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ]
  });

  try {

    // if courses exist
    if (courses) {

      // return a successful status
      res.status(200).json(courses);
      
    } else {

      // return not found
      res.sendStatus(404);

    }    

  } catch (error) {

    throw error;

  }

}));

router.get('/courses/:id', asyncHandler(async (req, res) => {

  // find course in database
  const course = await Course.findAll({
    where : {
      "id" : req.params.id
    },
    attributes : 
    [ "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId" ]
  });

  try {   

    // if course exists
    if(course) {

      // return a successful status
      res.status(200).json(course);

    } else {

      // return not found
      res.sendStatus(404);

    }

  } catch (error) {

    throw error;

  }

}));

router.post('/courses', authenticateUser,
                        titleCheck, 
                        descriptionCheck,
                        userIdCheck,
                        asyncHandler(async (req, res) => {

  // check validation for errors
  const errors = validationResult(req);

  // if there are any errors
  if (!errors.isEmpty()) {

    const errorMessages = errors.array().map(error => error.msg);
    // map and print them as json
    res.status(400).json({ errors : errorMessages });  

  } else {
    
    try {

      // create database record
      await Course.create(req.body);

      let redirect = `/courses/${req.body.userId}`;

      // returns no content
      res.header('Location',redirect).sendStatus(201);
      
    } catch (error) {

      if (error.name === "SequelizeValidationError") {

        res.status(400).json({ errors : error.errors });
  
      } else {
  
        throw error;
  
      }
      
    }

  }

}));

router.put('/courses/:id', authenticateUser,
                           titleCheck, 
                           descriptionCheck,
                           userIdCheck,
                           asyncHandler(async (req, res) => {

  // check validation for errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    const errorMessages = errors.array().map(error => error.msg);

    // return bad request status + display errors
    res.status(400).json({ errors : errorMessages });
    
  } else {

    // find course in database
    const course = await Course.findByPk(req.params.id);

    try {

      // if course exists
      if (course) {

        // check authentication data against course data
        // if the id's match, then we're good
        if (req.currentUser.id == course.userId) {

          // set which columns are available for update
          course.update({ 
            userId : req.body.userId,
            title : req.body.title,
            description : req.body.description
          }).then(() => {
            // return status no content
            res.sendStatus(204);
          });

        } else {
          
          // if the id's don't match, this isn't the owner!
          res.status(403).json({ message : 'Access Denied' });
        
        }

      } else {

        // return not found
        res.sendStatus(404);

      }
    
    } catch (error) {
      
      if (error.name === "SequelizeValidationError") {

        res.status(500).json({ errors : error.errors });

      } else {

        throw error;

      }
    }
  }

}));

router.delete('/courses/:id', authenticateUser,
                              asyncHandler(async (req, res) => {

  // find course in database
  const course = await Course.findByPk(req.params.id);

  // if course exists
  if (course) {

    // check authentication data against course data
    // if the id's match, then we're good
    if (req.currentUser.id == course.userId) {

      // delete course
      await course.destroy();

      // return no content
      res.sendStatus(204);

    } else {

      // if the id's don't match, this isn't the owner!
      res.status(403).json({ message : 'Access Denied' });

    }

  } else {

    // return not found
    res.sendStatus(404);

  }  

}));

module.exports = router;
