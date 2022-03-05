import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/productReviews');

const photosSchema = new mongoose.Schema({
  _id: Number,
  urls: [String]
});

const reviewsSchema = new mongoose.Schema({
  review_id: { type: Number, unique: true},
  rating: Number,
  summary: String,
  recommend: String,
  response: String,
  body: String,
  date: String,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: Number,
  reported: String,
  photos: [ photosSchema ]
});

const productsSchema = new mongoose.Schema({
  _id: Number,
  results: [reviewsSchema]
});


const reviews = mongoose.model('allreviews', productsSchema);
const photos = mongoose.model('allphotos', photosSchema);


const saveNewReview = async function (reviewObj) {
  let newReviewId;
  let newDate = new Date();
  let ticks = newDate.getTime().toString();

  await reviews.find({}).sort({ 'results.review_id': -1 }).limit(1).exec()
  .then((doc) => {
    let results = doc[0].results;
    newReviewId = Math.max.apply(Math, results.map((currentReview) => {
      return currentReview.review_id;
    })) + 1;
  })
  .catch((err) => {
    console.log(`Error finding largest review_id`, err);
  });

  const newReview = {
    review_id: newReviewId,
    rating: Number(reviewObj.rating),
    summary: reviewObj.summary,
    body: reviewObj.body,
    date: ticks,
    recommend: reviewObj.recommend,
    reported: 'false',
    reviewer_name: reviewObj.name,
    reviewer_email: reviewObj.email,
    helpfulness: 0,
    photos: JSON.parse(reviewObj.photos) || []
  };

  await reviews.findOne({ _id: Number(reviewObj.product_id) }).exec()
  .then((doc) => {
    let results = doc.results;
    results.push(newReview);
    doc.save();
  })
  .catch((err) => {
    console.log('Error saving new review to product_id: ', reviewObj.product_id, ' Error: ', err);
  });
};

const getReviewsdb = async function (paramsObj) {
  let sortBy;

  let transformedReviews = {
    product_id: paramsObj.product_id,
    page: paramsObj.page || 0,
    count: paramsObj.count || 5,
    results: []
  };

  if (paramsObj.sort === 'newest') {
    sortBy = function(a, b) {
      return b.date - a.date;
    };
  } else if (paramsObj.sort === 'helpful') {
    sortBy = function(a, b) {
      return b.helpfulness - a.helpfulness;
    };
  } else if (paramsObj.sort === 'relevant') {
    sortBy = function(a, b) {
      return b.helpfulness - a.helpfulness;
    };
  }

  await reviews.find({ _id: paramsObj.product_id }).exec()
  .then(async (productReviews) => {
    for (let review = 0; review < transformedReviews.count; review++) {
      if (productReviews[0].results[review].reported === 'false' || productReviews[0].results[review].reported === undefined) {
        transformedReviews.results.push(productReviews[0].results[review]);
      }
    }
  })
  .then(async () => {
    for (let review = 0; review < transformedReviews.results.length; review++) {
      transformedReviews.results[review].review_id = transformedReviews.results[review]._id;
      delete transformedReviews.results[review]._id;
      let revId = transformedReviews.results[review].review_id;
      let currentPhotos = await photos.find({ _id: revId }).exec()
      .catch((err) => {
        console.log('Error getting photos: ', err);
      });
      transformedReviews.results[review]["photos"] = currentPhotos;
      transformedReviews.results[review].date = new Date(parseInt(transformedReviews.results[review].date)).toString();
    }
    transformedReviews.results = transformedReviews.results.sort(sortBy);
  })
  .catch((err) => {
    console.log('Error finding reviews by product_id: ', err);
  });

  return transformedReviews;
};

const markReviewHelpful = async function(reviewId) {
  await reviews.findOne({ 'results.review_id': reviewId }).exec()
  .then((doc) => {
    let results = doc.results;
    for (let review = 0; review < results.length; review++) {
      if (results[review].review_id === Number(reviewId)) {
        results[review].helpfulness++;
      }
    }
    doc.save();
    console.log('Helpfulness update on review_id: ', reviewId);
  })
  .catch((err) => {
    console.log(`Error incrementing helpfulness on review_id: ${reviewId}, Error: `, err);
  });
}

const reportReview = async function(reviewId) {
  await reviews.findOne({ 'results.review_id': reviewId }).exec()
  .then((doc) => {
    let results = doc.results;
    for (let review = 0; review < results.length; review++) {
      if (results[review].review_id === Number(reviewId)) {
        results[review].reported = 'true';
      }
    }
    doc.save();
    console.log(`review_id: ${reviewId} marked as reported`);
  })
  .catch((err) => {
    console.log(`Error marking review_id: ${reviewId} as reported: `, err);
  });
}


export { getReviewsdb, saveNewReview, markReviewHelpful, reportReview, reviews };