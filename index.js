import express from 'express';
import * as crypto from "crypto";
import { execFile } from 'child_process';

const app = express();

const verify_signature = (req) => {
  const signature = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
  let untrusted = Buffer.from(req.headers['x-hub-signature-256'], 'ascii');
  return crypto.timingSafeEqual(trusted, untrusted);
};

const execute = () => execFile(
  `bash`, 
  [
    'deploy.sh',
    process.env.APP_PATH,
    process.env.DOCKER_USERNAME,
    process.env.DOCKER_PASSWORD,
  ], 
  (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  }
);

app.post('/github/webhook', express.json({type: 'application/json'}), async (req, res) => {
  try {
    if (!verify_signature(req)) {
      res.status(401).send("I'm a very rich widow with a terrible secret...but that's not the secret.");
      return;
    }
  
    const githubEvent = req.headers['x-github-event'];
  
    if (githubEvent === 'workflow_run') {
      if (req.body.action === 'completed' && req.body.workflow_run.display_title === 'deploy_app') {
        res
          .status(202)
          .send('Fine, I\'ll do it. But I\'m not happy about it...and I\'m going to tell everyone you hide your own easter eggs.');
  
        execute();
      }
    } else {
      res.status(422).send('Unprocessable');
  
      console.log(`${githubEvent} isn't the right github event. I like telling you because I want you're happiness to go away.`);
    }
  } catch (err) {
    res.status(500).send('I have no idea what I\'m doing.');
    console.log(err);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Blood orphans are ready and waiting on port ${process.env.PORT}`);
});
