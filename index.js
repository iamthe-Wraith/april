import express from 'express';
import * as crypto from "crypto";

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

app.post('/github/webhook', express.json({type: 'application/json'}), async (req, res) => {
  if (!verify_signature(req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  const githubEvent = req.headers['x-github-event'];

  if (githubEvent === 'workflow_run') {
    res.status(202).send('Accepted');

    if (req.body.action === 'completed' && req.body.workflow_run.display_title === 'deploy_app') {
      console.log(`Deploy app workflow completed!`);
      console.log(`Now it's time to restart docker in project: ${process.env.APP_PATH}`);

      // do something with the event
    }
  } else {
    res.status(422).send('Unprocessable');

    console.log(`Invalid github event received: ${githubEvent}`);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server ready and waiting on port ${process.env.PORT}`);
});
