import express from 'express';
import fs from 'fs';
import csvtojson from 'csvtojson';
import saveCSVProducts from '../db/productReviewsdb.js';
const app = express();
const port = 3000;


app.use(express.json());

app.get('/reviews', () => {

});

app.get('/reviews/meta', () => {

});

app.post('/review', () => {

});

app.post('/reviews/:review_id/helpful', () => {

});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});