import http from 'k6/http';
import { check } from 'k6';

export default function() {
  let response = http.get('http://localhost:3000/reviews?product_id=12&sort=newest');

  check(response, {
    'Status is 200': (res) => {
      return res.status === 200
    }
  });
}