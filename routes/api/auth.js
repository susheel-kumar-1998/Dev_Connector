const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');

//@route GET api/auth
//@desc Test route
//@access public
router.get('/', auth, async (req, res) => {
   try{
       const user = await User.findById(req.user.id).select('-password');
       res.json(user);
   } catch(err){
       console.log(err.message);
       res.status(500).send('Server Error');
   }
});

//@route POST api/auth
//@desc  Authenticate User and get token
//@access public
router.post(
    '/',
    [
       check('email', 'please enter a valid email').isEmail(),
       check('password', 'pswword is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { email, password } = req.body;
    
        try {
    
          // See if user exists
          let user = await User.findOne({email});
    
          if(!user)
          {
            return res.status(400).json({ errors: [{msg: 'Invalid Crendiatials'}] });
          }
          
          const isMatch = await bcrypt.compare(password, user.password);

          if(!isMatch)
          {
            return res.status(400).json({ errors: [{msg: 'Invalid Crendiatials'}] });
          }
            
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