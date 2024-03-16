import express from 'express';
import * as crypto from "crypto";

const app = express();

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const verify_signature = (req) => {
  const signature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
  let untrusted =  Buffer.from(req.headers['X-Hub-Signature-256'], 'ascii');
  return crypto.timingSafeEqual(trusted, untrusted);
};

app.post('/github/webhook', express.json({type: 'application/json'}), async (req, res) => {
  if (!verify_signature(req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  res.status(202).send('Accepted');

  const githubEvent = req.headers['x-github-event'];

  if (githubEvent === 'push') {
    console.log('GitHub event: ', githubEvent);
  } else {
    console.log(`Invalid github event received: ${githubEvent}`);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server ready and waiting on port ${process.env.PORT}`);
});
