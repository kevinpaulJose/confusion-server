const express = require('express');
const bodyParser = require('body-parser');

const Leaders = require('../models/leaders');

const leadersRouter = express.Router();


leadersRouter.use(bodyParser.json());

leadersRouter.route('/')
.get((req, res, next) => {
    Leaders.find({})
    .then((leaders) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }, (err) => {
        next(err);
    })
    .catch((err) => next(err));
})
.post((req, res, next) => {
    Leaders.create(req.body)
    .then((leader) => {
        console.log('Leader Created ', leader);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => {
        next(err);
    })
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /leaders');
})
.delete((req, res, next) => {
    Leaders.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => {
        next(err);
    })
    .catch((err) => next(err));
});


leadersRouter.route('/:leadersId')
.get((req, res, next) => {
    Leaders.findById(req.params.leadersId)
    .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => {
        next(err);
    })
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/'+req.params.leadersId);
})
.put((req, res, next) => {
    Leaders.findByIdAndUpdate(req.params.leadersId, {
        $set: req.body
    }, { new: true })
    .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => {
        next(err);
    })
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Leaders.findOneAndRemove(req.params.leadersId)
    .then((resp) => {
        res.statusCode = 200;
        res.json(resp);
    }, (err) => {
        next(err);
    })
    .catch((err) => next(err));
});

module.exports = leadersRouter;