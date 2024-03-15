import express from 'express';

const app = express();

app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {

  response.status(202).send('Accepted');

  const githubEvent = request.headers['x-github-event'];

  console.log('Request: ', request);
  console.log('GitHub event: ', githubEvent);

//   if (githubEvent === 'issues') {
//     const data = request.body;
//     const action = data.action;
//     if (action === 'opened') {
//       console.log(`An issue was opened with this title: ${data.issue.title}`);
//     } else if (action === 'closed') {
//       console.log(`An issue was closed by ${data.issue.user.login}`);
//     } else {
//       console.log(`Unhandled action for the issue event: ${action}`);
//     }
//   } else if (githubEvent === 'ping') {
//     console.log('GitHub sent the ping event');
//   } else {
//     console.log(`Unhandled event: ${githubEvent}`);
//   }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server ready and waiting on port ${port}`);
});