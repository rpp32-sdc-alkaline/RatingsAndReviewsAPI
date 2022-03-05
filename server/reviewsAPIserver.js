import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import  { getReviewsdb, saveNewReview, markReviewHelpful, reportReview } from '../db/productReviewsdb.js';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));

app.get('/reviews', (req, res) => {
  var params = {
    product_id: req.query.product_id,
    sort: req.query.sort,
    page: req.query.page,
    count: req.query.count
  }
  getReviewsdb(params)
  .then((reviews) => {
    if (reviews.results.length === 0) {
      res.status(404).send('Could not find reviews for product_id: ' + req.query.product_id);
    } else {
      res.status(200).send(reviews);
    }
  });
});

app.post('/reviews', (req, res) => {
  saveNewReview(req.body)
  .then(() => {
    res.status(201).end();
  })
  .catch((err) => {
    console.log('function is problem')
    res.status(400).send(err);
  });
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  const reviewId = req.params.review_id;

  markReviewHelpful(reviewId)
  .then(() => {
    res.status(204).end();
  })
  .catch((err) => {
    res.status(400).send(err);
  })
});

app.put('/reviews/:review_id/report', (req, res) => {
  const reviewId = req.params.review_id;

  reportReview(reviewId)
  .then(() => {
    res.status(204).end();
  })
  .catch((err) => {
    res.status(400).send(err);
  });
})

app.listen(port, (req, res) => {
  console.log(`Listening on port ${port}`);
});