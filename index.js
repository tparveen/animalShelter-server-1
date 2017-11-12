'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const { dbConnect } = require('./db-knex');

const { Queue, peek } = require('./Queue');
const { catData, dogData } = require('./animalData');

// Initialize empty queues for the cat and dog.
const [ catQ, dogQ ] = [ new Queue(), new Queue() ];

/**
 * Fill a queue with data.
 * @param {Queue} queue - a Queue object to populate.
 * @param {(Object[]|Object)} data - a single object or array of objects with information about an animal.
 */
function populateQueue(queue, data) {
  // spread the data into an array
  // so we can iterate regardless of whether
  // the data is one animal or several
  data = [...data];

  for (let i = 0; i < data.length; i ++) {
    queue.enqueue(data[i]);
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

// By calling the populateQueue function in our get endpoints
// we're ensuring there are always animals to see.
// You would not do this in production, as it gives a false impression
// of the availability of the animals.

app.get('/api/cat', (req, res, next) => {
  
  populateQueue(catQ, catData);
  return res.json(peek(catQ));
});

app.get('/api/dog', (req, res, next) => {
  
  populateQueue(dogQ, dogData);
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

/**
 * Start the node application.
 * @param {number} port - an available port.
 */
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
