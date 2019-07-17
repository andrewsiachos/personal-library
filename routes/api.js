/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
mongoose.connect(MONGODB_CONNECTION_STRING);

var booksSchema = new Schema({
  title:String,
  comments:[String],
  commentCount:Number
});

var Books = mongoose.model('Books', booksSchema);



module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Books.find({}, (error, data)=>{
        if(error){
          res.json({message:'error reading database.'});
        }else{
          var myObj = [];
          for(let i=0;i<data.length;i++){
            myObj.push({title:data[i].title, id:data[i]._id, commentCount:data[i].commentCount});
          }
          res.json(myObj);
        }
      });
      
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      Books.findOne({title:title}, (error, data)=>{
        if(error){
          res.send("Error reading database");
        }else{
          if(data==null){
            var newData = new Books({
              title:title,
              comments:[],
              commentCount:0
            });
            
            newData.save((err)=>{
              if(err){
                res.send('Error saving to database');
              }
            });
            
            res.json({title:title, comments:[]});
          }else{
            res.json({message:'book already exists'});
          } 
        }
        
          
      });
    
    
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Books.remove({}, (error, data)=>{
        
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Books.findOne({title:bookid}, (error, data)=>{
        if(error){
          res.json({message:'error reading database'});
        }else{
          if(data==null){
            res.json({message:'book doesn\'t exist'});
          }else{
            res.json({title:data.title, comments:data.comments});
          }
        }
      });
      
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      Books.findOne({title:bookid}, (error, data)=>{
        if(error){
          res.json({message:'error reading database'});
        }else{
          if(data==null){
            res.json({message:"book doesn't exist"})
          }else{
            
            if(comment.trim()==""){
              res.json({message:'comment is empty'});
            }else{
              data.comments.push(comment);
              data.commentCount += 1;
              data.save((err)=>{
                if(err){
                  res.send('error writing to database');
                }
              });
              
              res.json({title:data.title, comments:data.comments, commentCount:data.commentCount});
            }
          }
        }
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Books.findOneAndRemove({title:bookid}, (error, data)=>{
        if(error){
          res.send('an error occured');
        }else{
          data.save((err)=>{
            if(err){
              res.send('error reading database');
            }
          });
        }
      });
    });
  
};
