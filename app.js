const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan')

const app = express();
app.use(morgan('combined'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


mongoose.connect('mongodb://localhost:27017/wikiDB', { useNewUrlParser: true, useUnifiedTopology: true })

const articleSchema = {
    title: String,
    content: String
}
const Article = mongoose.model('Article', articleSchema);

//////////////////////////// REQUEST TARGETING ALL ARTICLES ////////////////////////////

app.route('/articles')
    .get((req, res) => {
        Article.find((err, foundArticles) => {
            if (!err) {
                res.send(foundArticles)
            } else {
                console.log(err)
            }
        })
    }).post((req, res) => {
        const { title, content } = req.body;
        const article = new Article({
            title,
            content
        })
        article.save();
        console.log(title, content)
        res.send('Created with Success')
    }).delete((req, res) => {
        Article.deleteMany((err) => {
            if (!err) {
                res.send('Deleted all Articles')
            } else {
                res.send(err)
            }
        })
    })


//////////////////////////// REQUEST TARGETING A SPECIFIC ARTICLE ////////////////////////////

app.route("/articles/:articleTitle")
    .get((req, res) => {
        Article.findOne({title: req.params.articleTitle},(err, foundArticle)=>{
            if(foundArticle){
                res.send(foundArticle);    
            }else{
                console.log('No Articles were to be found')
                console.log(err);
            }
        })
       
    })
    //Overwrites (Kinda removes the field from the document in the db that you didn't provide a value for!)
    .put((req,res)=>{
        Article.update(
            {title: req.params.articleTitle},
            {title: req.body.title,content: req.body.content},
            {overwrite: true},
            (err)=>{
                if(!err){
                    console.log('Successfully updated article')
                }
            }
        )
    })
    //Uses the $SET flag and updates only the fields that are coming within the body.
    .patch((req,res)=>{
        Article.update(
            {title: req.params.title},
            {$set: req.body},
            (err)=>{
                console.log(err)
            }
        )
    })
    .delete((req,res)=>{
        Article.deleteOne(
            {title: req.params.title},
            err=>{
            if(!err){
                res.send('Deleted Article');
            }else{
                res.send(err);
            }
        })
    });


app.listen(process.env.PORT || 3333, () => {
    console.log('Server UP and Running on port 3333');
})
