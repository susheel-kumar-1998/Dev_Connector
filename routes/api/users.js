const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

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
(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({ errors: errors.array() });
    }
    res.send('User Registered Successfully');
});

module.exports = router;