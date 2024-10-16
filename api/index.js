const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const keywordExtractor = require('keyword-extractor');
const axios = require('axios');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

const app = express();

const DB_URL = process.env.DB_URL;
const HF_API_KEY = process.env.HF_API_KEY;

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });


const salt = bcrypt.genSaltSync(10);
const secretKey = 'alskdjfhgb';
// use function
app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());

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
    if(!token) return res.json("No token");
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

// Endpoint to extract keywords from the provided text
app.post('/extract-keywords', (req, res) => {
    const { content } = req.body;
    const textContent = content && content.content ? content.content : content;
    console.log('Received text content:', textContent);

    if (!textContent || typeof textContent !== 'string' || textContent.trim() === '') {
        console.log('Invalid content');
        return res.status(400).json({ error: 'Content must be a non-empty string' });
    }

    const extractionResult = keywordExtractor.extract(textContent, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
    });

    console.log('Extraction result:', extractionResult);
    res.json({ keywords: extractionResult });
});


// Endpoint to generate an idea based on the extracted keywords
app.post('/generate-idea', async (req, res) => {
    const { content } = req.body;
    const textContent = Array.isArray(content) ? content.join(' ') : content;

    if (!textContent || typeof textContent !== 'string' || textContent.trim() === '') {
        return res.status(400).json({ error: 'Content must be a non-empty string' });
    }

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            { inputs: textContent },
            { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
        );

        if (response.data && response.data.length > 0) {
            let generatedText = response.data[0].generated_text;
            generatedText = generatedText.replace(/undefined/g, '').trim(); // Remove all occurrences of 'undefined' and trim whitespace
            res.json({ idea: generatedText });
        } else {
            res.status(500).json({ error: 'No generated text found' });
        }
    } catch (error) {
        console.error('Error generating idea:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error generating idea' });
    }
});


app.listen(4000);