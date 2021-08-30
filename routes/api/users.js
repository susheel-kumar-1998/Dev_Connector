const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const e = require('express');

//@route POST api/users
//@desc  Register User route
//@access public
router.post(
'/',
[
  check('name', 'Name is Required')
    .not()
    .isEmpty(),
   check('email', 'please enter a valid email').isEmail(),
   check('password', 'please enter a password with 6 or more characters').isLength({ min:6 })
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {

      // See if user exists
      let user = await User.findOne({email});

      if(user)
      {
        return res.status(400).json({ errors: [{msg: 'User already Exists'}] });
      }

      // Get users avatar
      const avatar = gravatar.url(email, {
        s: '200', //image size 
        r: 'pg', // rating 
        d: 'mm' //default image
      })

      user = new User({
        name,
        email,
        avatar,
        password
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      user.save();

      const payload = {
        user: {
          id: user.id
        }
      }

      // Return JsonWebToken
      jwt.sign(
        payload, 
        config.get('jwtSecret'),
        {expiresIn: 36000},
        (err, token) => {
          if(err) throw err;
          res.json({token});
        }
        );

      //res.send('User Registered Successfully');

    } catch( err )
    {
      console.error(err.message);
      res.status(500).send('Server Error');
    }

});


module.exports = router;