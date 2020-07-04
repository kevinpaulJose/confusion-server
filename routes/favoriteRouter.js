const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');
const { raw } = require('express');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => {
        next(err);
    })
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    var userId = mongoose.Types.ObjectId(req.user._id);
    Favorites.find({ user: userId })
    .then((favorite) => {
    if (favorite == null || favorite.length == 0) {
        console.log("User does not have a favorite dish yet.");
        req.body.user = req.user._id;
        favorite = [];
        favorite.push(req.body);   
        Favorites.create(favorite)    
        .then((favorite) => {    
            console.log('Favorite Created ', favorite);    
            res.statusCode = 200;   
            res.setHeader('Content-Type', 'application/json');   
            res.json(favorite);    
        }, (err) => next(err));    
    } else {
        console.log("User already has a favorite dish");  
        console.log(favorite[0].user);
        Favorites.update({user: req.user._id},{$addToSet: {"dishes": req.body.dishes}})
        .then((favorite) => {    
            res.statusCode = 200;    
            res.setHeader('Content-Type', 'application/json');    
            res.json(favorite);    
        }, (err) => next(err)); 

   
    }   
    }, (err) => next(err))    
    .catch((err) => next(err));   
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({user: req.user._id})
        .then((favorite) => {
            if(favorite == null || favorite.length > 0){
                Favorites.find({user: req.user._id}).remove()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => {
                    next(err);
                })
            }else {
                var err = new Error("No Favorites for this user.");
                next(err);
            }
        }, (err) => {
            next(err);
        })
        .catch((err) => next(err));
    });




favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.sendStatus(200);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

    var userId = mongoose.Types.ObjectId(req.user._id);
    Favorites.find({ user: userId })
    .then((favorite) => {
    if (favorite == null || favorite.length == 0) {
        console.log("User does not have a favorite dish yet.");
        var dishList = [];
        dishList.push(req.params.dishId);
        req.body.user = req.user._id;
        req.body.dishes = dishList;
        favorite = [];
        favorite.push(req.body);   
        Favorites.create(favorite)    
        .then((favorite) => {    
            console.log('Favorite Created ', favorite);    
            res.statusCode = 200;   
            res.setHeader('Content-Type', 'application/json');   
            res.json(favorite);    
        }, (err) => next(err));    
    } else {
        console.log("User already has a favorite dish");  
        console.log(favorite[0].user);
        if(favorite[0].dishes.indexOf(req.params.dishId) == -1){
            favorite[0].dishes.push(req.params.dishId);    
            favorite[0].save()    
            .then((favorite) => {    
                res.statusCode = 200;    
                res.setHeader('Content-Type', 'application/json');    
                res.json(favorite);    
            }, (err) => next(err)); 
        }else {
            var err = new Error("Already Favorite");
            next(err);
        } 
   
    }   
    }, (err) => next(err))    
    .catch((err) => next(err));   
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({user: req.user._id})
        .then((favorite) => {
            if(favorite!=null){
                if(favorite[0].dishes.length == 1){
                    Favorites.find({user: req.user._id}).remove()
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }, (err) => {
                        next(err);
                    })
                }else{
                    Favorites.update({user: req.user._id}, {$pull: {"dishes": req.params.dishId}})
                    .then((favorite) => {
                        res.statusCode = 200;    
                        res.setHeader('Content-Type', 'application/json');    
                        res.json(favorite); 
                    }, (err) => {
                        next(err);
                    })
                }

                // favorite[0].dishes.id(req.params.dishId).remove();
                
            }else if(favorite == null) {
                err = new Error('favorite '+req.params.dishId +' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => {
            next(err);
        })
        .catch((err) => next(err));
    });


module.exports = favoriteRouter;