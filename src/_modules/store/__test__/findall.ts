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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDM0ZDRjOS03YzVmLTQyNzgtYWIxOC1iY2ZiMTljNWM5YTQiLCJpZCI6NSwiaWF0IjoxNzMxOTY4ODczLCJleHAiOjE3MzI1Njg4NzN9.KjdbvSvfL7al1LKi_ufLUdqFznD8DDiCTjPYhPTpa60';
  const res = http.get('http://localhost:3030/api/v1/store', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    // eslint-disable-next-line no-console
    console.error(`Request failed. Status: ${res.status}`);
  }
  sleep(1);
}
