import { sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp-up to 100 users
    { duration: '1m', target: 100 }, // Sustained load
    { duration: '10s', target: 0 }, // Ramp-down
  ],
};

export default function () {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YzUyYTNkNC1hZjlkLTQyMWItYWMyYi1mOGM5OWIwNDc2NGUiLCJpZCI6NiwiaWF0IjoxNzMyMDA2NzYzLCJleHAiOjE3MzI2MDY3NjN9.NlJslrtdCcIidNu4BV9oRJvkou6lBOw9jKcgRvKkkw4';
  const res = http.get(
    'http://127.0.0.1:3030/api/v1/store/nearest?lat=23&lng=45&radiusLimit=80000',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (res.status !== 200) {
    // eslint-disable-next-line no-console
    console.error(`Request failed. Status: ${res.status}`);
  }
  sleep(1);
}
