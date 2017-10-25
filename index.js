const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const Queue = require('./queue');

const app = express();

//function to create the queue of animals
const dogQ = new Queue();
const catQ = new Queue();

function makeDogQueue(dog) {
  //There is always a dog there
  dogQ.enqueue({
    //imageURL:'http:/', //add images to flick or AWS
    imageURL:
      'http://www.dogster.com/wp-content/uploads/2015/05/Cute%20dog%20listening%20to%20music%201_1.jpg', //add images to flick or AWS
    name: 'Zeus',
    gender: 'Male',
    age: '3 yrs',
    breed: 'Golden Retriever',
    story: 'Owner Passed away'
  });
  dogQ.enqueue({
    imageURL:
      'http://www.dogbreedslist.info/uploads/allimg/dog-pictures/German-Shepherd-Dog-1.jpg',
    name: 'Tornado',
    gender: 'Female',
    age: '5 yrs',
    breed: 'German Shepard',
    story: 'Owner moved to a small aparment'
  });
  dogQ.enqueue(dog);
}
function makeCatQueue(cat) {
  catQ.enqueue({
    imageURL:
      'https://assets3.thrillist.com/v1/image/2622128/size/tmg-slideshow_l.jpg',
    name: 'Fluffy',
    gender: 'Female',
    age: '2 yrs',
    breed: 'Bengal',
    story: 'Thrown on the street'
  });
  catQ.enqueue({
    imageURL:
      'http://www.catvet.ca/wp-content/uploads/2016/07/cathealth_kitty.jpg',
    name: 'Thunder',
    gender: 'Male',
    age: '1 yr',
    breed: 'Taby',
    story: 'Owner moved to another country'
  });

  catQ.enqueue(cat);
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

app.get('/api/cat', (req, res, next) => {
  makeCatQueue({
    imageURL:
      'https://assets3.thrillist.com/v1/image/2622128/size/tmg-slideshow_l.jpg',
    name: 'Fluffy',
    gender: 'Female',
    age: '2 yrs',
    breed: 'Bengal',
    story: 'Thrown on the street'
  });
  return res.json(catQ.dequeue());
});

app.get('/api/dog', (req, res, next) => {
  makeDogQueue({
    imageURL:
      'http://img.freepik.com/free-photo/husky-breed-dog-with-tongue-out_1187-1500.jpg?size=338&ext=jpg',
    name: 'June',
    gender: 'Female',
    age: '1 yrs',
    breed: 'Shiba',
    story: 'Rejected by mother'
  });
  return res.json(dogQ.dequeue());
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
