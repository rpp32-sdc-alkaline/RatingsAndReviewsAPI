import axios from 'axios';
import mongoose from 'mongoose';
import { jest } from '@jest/globals'
import { getReviewsdb, saveNewReview, markReviewHelpful, reviews } from '../db/productReviewsdb.js';

//set test timout to 60 seconds
jest.setTimeout(90 * 1000);

//close db connection after test runs to avoid warning
afterAll(async () => {
  await mongoose.connection.close();
});

describe('getting reviews from db', () => {
  test('Should send back an array of 6 reviews for product_id when requested', async () => {
    const paramsObj = {
      product_id: 12,
      count: 6,
      page: 1
    };

    const response = await axios.get('http://localhost:3000/reviews', {
      params: paramsObj
    });

    expect(Array.isArray(response.data.results) && response.data.results.length === 6).toBeTruthy();
  });

  test('Should send back only 5 reviews by default', async () => {
    const paramsObj = {
      product_id: 12
    };

    const response = await axios.get('http://localhost:3000/reviews', {
      params: paramsObj
    });

    expect(response.data.results.length).toBe(5);
  });

  test('Should sort reviews received by newest to oldest', async () => {
    const paramsObj = {
      product_id: 12,
      sort: 'newest'
    };

    const response = await axios.get('http://localhost:3000/reviews', {
      params: paramsObj
    });

    const first = Date.parse(response.data.results[0].date);
    const second = Date.parse(response.data.results[1].date);
    const third = Date.parse(response.data.results[2].date);
    const forth = Date.parse(response.data.results[3].date);
    const fifth = Date.parse(response.data.results[4].date);

    expect(first > second && second > third && third > forth && forth > fifth).toBeTruthy();
  });
});

xdescribe('Saving to db', () => {
  //passed, but requires tedious removing of docs inserted by test
  test('Should save a review and characteristic to db', async () => {
    const reviewObj = {
      product_id: 1000000000000000000,
      rating: 5,
      summary: 'This is a test',
      body: 'This is a test to show that I can save new reviews to my database',
      recommend: true,
      name: 'testUser',
      email: 'testUser@test.com',
      photos: []
    };

    await axios.post('http://localhost:3000/reviews', reviewObj);

    var paramsObj = {
      product_id: 999999999999999999
    };

    var response = await axios.get('http://localhost:3000/reviews', {
      params: paramsObj
    });

    expect(response.data.results.length === 1).toBeTruthy();
  })
});

describe('Helpfulness', () => {
  test('Should increase helpfulness of review', async () => {
    let oldHelp;
    let newHelp;

    await reviews.find({ 'results.review_id': 20 }).exec()
    .then((docArray) => {
      oldHelp = docArray[0].results.helpfulness;
    })
    .catch((err) => {
      console.log('1st - Error finding review for review_id: 20; Error: ', err);
    })

    await axios.post(`http://localhost:3000/reviews/${20}/helpful`);

    await reviews.find({ 'results.review_id': 20 }).exec()
    .then((docArray) => {
      newHelp = docArray[0].results.helpfulness;
    })
    .catch((err) => {
      console.log('2nd - Error finding review for review_id: 20; Error: ', err);
    });

    await reviews.updateOne({ 'results.review_id': 20 }, { $inc: { 'results.helpfulness': -1 }}).exec()
    .then(() => {
      console.log('Test for helpfulness reverted back to normal');
    })
    .catch((err) => {
      console.log('Error reverting helpfulness test back to normal: ', err);
    });

    expect(newHelp - oldHelp).toBe(1);

  });
});

describe('Reporting reviews', () => {
  test('Should mark a review as reported', async () => {
    let reportStatus;

    await axios.put(`http://localhost:3000/reviews/${20}/report`);

    await reviews.find({ 'results.review_id': 20 }).exec()
    .then((docArray) => {
      reportStatus = docArray[0].results.reported;
    })
    .catch((err) => {
      console.log(`Error finding status of reported review_id: 20, Error: ${err}`);
    });

    await reviews.updateOne({ 'results.review_id': 20 }, { 'results.reported': 'false' }).exec()
    .then(() => {
      console.log(`Test changes reverted back to normal`);
    })
    .catch((err) => {
      console.log(`Error reverting test changes back to normal: ${err}`);
    });

    expect(reportStatus).toBe('true');
  })
})
