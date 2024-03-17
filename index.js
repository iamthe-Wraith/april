import express from 'express';
import * as crypto from "crypto";
import { execFile } from 'child_process';

const app = express();

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

/**
 * this function is dependent on the structure of the github webhook event,
 * but should return a non-github dependent object that can be used to determine
 * if the event is the correct event to act on. 
 */
const getAction = (req) => {
  let action; // values: 
  
  if (req.headers['x-github-event'] === 'workflow_run' && req.body.action === 'completed' && req.body.workflow.name === 'Publish Docker Image') {
    action = 'deploy'
  }

  return action;
}

const verify_signature = (req) => {
  const signature = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
  let untrusted = Buffer.from(req.headers['x-hub-signature-256'], 'ascii');
  return crypto.timingSafeEqual(trusted, untrusted);
};

app.post('/deploy/webhook', express.json({type: 'application/json'}), async (req, res) => {
  try {
    if (!verify_signature(req)) {
      res.status(401).send("I'm a very rich widow with a terrible secret...but that's not the secret.");
      return;
    }
  
    const action = getAction(req);

    switch (action) {
      case 'deploy':
        res
          .status(202)
          .send('Fine, I\'ll do it. But I\'m not happy about it...and I\'m going to tell everyone you hide your own easter eggs.');
  
        execute();
        break;
      default:
        const msg = 'Yeeeah, I\'m not doing that. I like telling you because I want you\'re happiness to go away.';
        res.status(422).send(msg);
        console.log(msg, action, req.headers, req.body);
    }
  } catch (err) {
    res.status(500).send('I have no idea what I\'m doing.');
    console.log(err);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Blood orphans are ready and waiting on port ${process.env.PORT}`);
});
