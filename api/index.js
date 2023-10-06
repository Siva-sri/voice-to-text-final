const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const Post = require('./models/Post');

const app = express();

const salt = bcrypt.genSaltSync(10);
const secretKey = 'alskdjfhgb';
// use function
app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb+srv://voice:vlVhRx638RsBgt14@cluster0.dtmkegq.mongodb.net/');

app.post('/register',async(req,res) => {
    const {username,password} = req.body;
  try{
    const userDet = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDet);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login',async (req,res)=>{
    const {username,password} = req.body;
    const userDetail = await User.findOne({username});
    if(userDetail === null){
        res.status(400).json('Wrong username');
    } else{
        const auth = bcrypt.compareSync(password, userDetail.password);
        if(auth){
            //login
            jwt.sign({username,id:userDetail._id},secretKey,{},(err,token)=>{
                if (err) throw err;
                res.cookie('token',token).json({
                    id:userDetail._id,
                    username
                });
            });
        }else{
            res.status(400).json('Wrong credentials');
        }
    }
});

app.get('/profile', (req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token,secretKey,{},(err,info)=>{
        if (err) throw err;
        res.json(info);
    });
});

app.post('/logout',(req,res) =>{
    res.cookie('token','').json('ok');
});

app.post('/post',async(req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token,secretKey,{}, async(err,info)=>{
        if (err) throw err;
        const {title,summary,content} = req.body;
        const postDet = await Post.create({
            title,
            summary,
            content,
            author:info.id
        });
        res.json(postDet);
    });
});

app.put('/post', async(req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token,secretKey,{}, async(err,info)=>{
        if (err) throw err;
        const {id,title,summary,content} = req.body;
        const postDet = await Post.findById(id);
        const isAuthor = JSON.stringify(postDet.author) === JSON.stringify(info.id);
        if(!isAuthor){
            return res.status(400).json('you are not the author');
        }
        await postDet.updateOne({title,summary,content});
        res.json(postDet);
    });
});

app.get('/post',async(req,res) =>{
    res.json(await Post.find().populate('author',['username']).sort({createdAt:-1}).limit(20));
});

app.get('/post/:id',async(req,res)=>{
    const {id} = req.params;
    const postDet = await Post.findById(id).populate('author',['username']);
    res.json(postDet);
});

app.listen(4000);