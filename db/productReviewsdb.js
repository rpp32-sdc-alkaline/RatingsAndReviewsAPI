import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/productReviews');

const photosSchema = new mongoose.Schema({
  review_id: Number,
  url: String
});

const characteristicsSchema = new mongoose.Schema({
  review_id: Number,
  characteristic_id: Number,
  value: Number
});

const reviewsSchema = new mongoose.Schema({
  review_id: Number,
  rating: Number,
  summary: String,
  recommend: Boolean,
  response: String,
  body: String,
  date: String,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: Number
});

const productsSchema = new mongoose.Schema({
  product_id: Number,
  page: Number,
  count: Number,
  results: [reviewsSchema]
});


const reviews = mongoose.model('reviews', productsSchema);
const characteristics = mongoose.model('characteristics', characteristicsSchema);
const photos = mongoose.model('photos', photosSchema);


const saveNewReview = function (reviewObj) {

}

const getReviewsdb = function (paramsObj) {

}