import express from 'express';
import * as crypto from "crypto";
import { execFile } from 'child_process';

const app = express();

const execute = () => new Promise((resolve, reject) => {
  execFile(
    `bash`, 
    [
      'deploy.sh',
      process.env.APP_PATH,
      process.env.DOCKER_USERNAME,
      process.env.DOCKER_PASSWORD,
    ], 
    async (error, stdout, stderr) => {
      try {
        let params;
  
        if (error !== null) {
          console.log('error: ', error);

          params = {
            status: 'error',
            app: process.env.APP_NAME,
            message: error.message,
          };
        }
  
        if (stderr) {
          console.log('stderr', stderr);

          params = {
            status: 'error',
            app: process.env.APP_NAME,
            message: stderr,
          };
        } else {
          params = {
            status: 'ok',
            app: process.env.APP_NAME,
          };
        }
  
        const res = await fetch(`${process.env.VAL_TOWN_URL}?${new URLSearchParams(params)}`, {
          headers: {
            Authorization: process.env.VAL_TOWN_TOKEN
          }
        });

        if (res.ok) {
          console.log('res: ', await res.json());
          resolve();
        } else {
          console.log(await res.text());
          reject(new Error('The deployment email failed to send.'));
        }
      } catch (err) {
        reject(err);
      }
    }
  )
});

/**
 * this function is dependent on the structure of the github webhook event,
 * but should return a non-github dependent object that can be used to determine
 * if the event is the correct event to act on. 
 */
const getAction = (req) => {
  let action; // values: 
  
  if (req.headers['x-github-event'] === 'ping') {
    action = 'ping';
  } else if (req.headers['x-github-event'] === 'workflow_run' && req.body.action === 'completed' && req.body.workflow.name === 'Publish Docker Image') {
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
      case 'ping':
        res.status(200).send('Ugh, pings are so annoying. But at least I didn\'t make any new friends.');
        break;
      case 'deploy':
        try {
          execute();

          res
            .status(202)
            .send('Fine, I\'ll do it. But I\'m not happy about it...and I\'m going to tell everyone you hide your own easter eggs.');
        } catch (err) {
          res.status(500).send('Everything is broken. I\'m broken. You\'re broken. We\'re all broken.');
          console.log(err);
        }
  
        break;
      default:
        const msg = 'Yeeeah, I\'m not doing that. I like telling you because I want you\'re happiness to go away.';
        res.status(422).send(msg);
    }
  } catch (err) {
    res.status(500).send('I have no idea what I\'m doing.');
    console.log(err);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Blood orphans are ready and waiting on port ${process.env.PORT}`);
});
