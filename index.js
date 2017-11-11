'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const { dbConnect } = require('./db-knex');

const { Queue, peek } = require('./queue');

const app = express();

// Initialize empty queues for the cat and dog.
const dogQ = new Queue();
const catQ = new Queue();

// Functions for populating each queue.
// Each queue will start with at least 2 default animals,
// and also enqueue an optional third animal.
function makeCatQueue(queue, newCat) {
  queue.enqueue({
    imageURL:
      'https://assets3.thrillist.com/v1/image/2622128/size/tmg-slideshow_l.jpg',
    description: 'Orange bengal cat with black stripes lounging on concrete.',
    name: 'Fluffy',
    gender: 'Female',
    age: 2,
    breed: 'Bengal',
    story: 'Thrown on the street.'
  });
  queue.enqueue({
    imageURL:
      'http://www.catvet.ca/wp-content/uploads/2016/07/cathealth_kitty.jpg',
    description: 'Tan-colored kitten pawing at the camera.',
    name: 'Thunder',
    gender: 'Male',
    age: 1,
    breed: 'Tabby',
    story: 'Owner moved to another country.'
  });

  if (newCat) {
    queue.enqueue(newCat);
  }
}

function makeDogQueue(queue, newDog) {
  queue.enqueue({
    imageURL:
      'http://www.dogster.com/wp-content/uploads/2015/05/Cute%20dog%20listening%20to%20music%201_1.jpg',
    description: 'A smiling golden-brown golden retreiver listening to music.',
    name: 'Zeus',
    gender: 'Male',
    age: 3,
    breed: 'Golden retriever',
    story: 'Owner passed away.'
  });
  queue.enqueue({
    imageURL:
      'http://www.dogbreedslist.info/uploads/allimg/dog-pictures/German-Shepherd-Dog-1.jpg',
    description: 'A German shepherd dog facing the camera, tongue out.',
    name: 'Tornado',
    gender: 'Female',
    age: 5,
    breed: 'German shepherd',
    story: 'Owner moved to a small aparment.'
  });
  
  if (newDog) {
    queue.enqueue(newDog);
  }
}

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// By calling the makeQueue functions in our get endpoints
// we're ensuring there are always animals to see.
// You would not do this in production, as it gives a false impression
// of the availability of the animals.

app.get('/api/cat', (req, res, next) => {
  makeCatQueue(catQ, {
    imageURL: 'https://static.pexels.com/photos/20787/pexels-photo.jpg',
    description: 'Grey siamese cat with bright green eyes, looking up to the camera.',
    name: 'Tina',
    gender: 'female',
    age: 3,
    breed: 'Siamese',
    story: 'Abandoned by previous owner.'
  });
  return res.json(peek(catQ));
});

app.get('/api/dog', (req, res, next) => {
  makeDogQueue(dogQ, {
    imageURL:
      'http://img.freepik.com/free-photo/husky-breed-dog-with-tongue-out_1187-1500.jpg?size=338&ext=jpg',
    name: 'June',
    gender: 'female',
    age: 1,
    breed: 'Shiba Inu',
    story: 'Rejected by mother.'
  });
  return res.json(peek(dogQ));
});

app.delete('/api/cat', (req, res, next) => {
  catQ.dequeue();
  res.sendStatus(204);
});

app.delete('/api/dog', (req, res, next) => {
  dogQ.dequeue();
  res.sendStatus(204);
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
