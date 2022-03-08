import http from 'k6/http';
import getReviews from './getReviewsk6.js';

export const options = {
  stages: [
    { duration: '10s', target: 333 },
    { duration: '10s', target: 666 },
    { duration: '10s', target: 1000 },
    { duration: '10s', target: 0 }
  ]
};

export default function () {
  getReviews();
};