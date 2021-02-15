const db = require('../models');
const bcryptjs = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const {username, password,name} = req.body;
    const targetUser = await db.User.findOne({where: { username: username}});

    if (targetUser) {
        res.status(400).send({message: "Username already taken."});
    }else{
        const salt = bcryptjs.genSaltSync(12);
        const hashedPassword = bcryptjs.hashSync(password,salt);

        await db.User.create({
            username: username,
            password: hashedPassword,
            name: name
        });
        res.status(201).send({ message: "User created"})
    } 
};

const loginUser = async (req, res) =>{
    const {username, password} = req.body;
    const targetUser = await db.User.findOne({ where:{username: username}});
    if (!targetUser) {
        res.status(400).send({message: "Username or password is wrong"});
    }else{
        const isCorrectPassword = bcryptjs.compare(password,targetUser.password);
        if(isCorrectPassword){
            const payload = {
                name: targetUser.name,
                id: targetUser.id,
            };
            const token = jwt.sign(payload, process.env.SECRET_OR_KEY , {expiresIn:3000});

            res.status(200).send({
                token:token,
                message: "Login Successful"
            });
        }else{
            res.status(400).send({message: "Username or password is wrong"});
        }
    }
};

module.exports = {
    registerUser,
    loginUser
}