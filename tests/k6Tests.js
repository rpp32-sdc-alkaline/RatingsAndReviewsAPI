import http from 'k6/http';
import getReviews from './getReviewsk6.js';

export default function () {
  getReviews();
};