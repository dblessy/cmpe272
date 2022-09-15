import {got} from 'got';
import crypto from 'crypto';
import OAuth from "oauth-1.0a";
import dotenv from 'dotenv';
import qs from "querystring";
import * as readline from 'readline';

dotenv.config()
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// The code below sets the consumer key and consumer secret from your environment variables
// To set environment variables on macOS or Linux, run the export commands below from the terminal:
const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET;

// Be sure to replace your-tweet-id with the id of the Tweet you wish to delete.
const id = "1570304659574886401";
const endpointURL = `https://api.twitter.com/2/tweets/${id}`;

const oauth = new OAuth({
    consumer: {
        key: consumer_key,
        secret: consumer_secret,
    },
    signature_method: "HMAC-SHA1",
    hash_function: (baseString, key) =>
        crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

async function deleteRequest({ oauth_token, oauth_token_secret }) {
    const token = {
        key: oauth_token,
        secret: oauth_token_secret,
    };

    const authHeader = oauth.toHeader(
        oauth.authorize(
            {
                url: endpointURL,
                method: "DELETE",
            },
            token
        )
    );

    const req = await got.delete(endpointURL, {
        responseType: "json",
        headers: {
            Authorization: authHeader["Authorization"],
            "user-agent": "v2DeleteTweetJS",
            "content-type": "application/json",
            accept: "application/json",
        },
    });
    if (req.body) {
        return req.body;
    } else {
        throw new Error("Unsuccessful request");
    }
}

(async () => {
    try {
        const oAuthAccessToken = process.env.ACCESS_TOKEN;
        const oauthAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        // Make the request
        const response = await deleteRequest({
            oauth_token: oAuthAccessToken,
            oauth_token_secret: oauthAccessTokenSecret,
        });
        console.dir(response, {
            depth: null,
        });
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
    process.exit();
})();