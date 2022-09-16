import {got} from 'got';
import crypto from 'crypto';
import OAuth from "oauth-1.0a";
import dotenv from 'dotenv';
import express from 'express';

const app=new express();

dotenv.config()

// The code below sets the consumer key and consumer secret from your environment variables
// To set environment variables on macOS or Linux, run the export commands below from the terminal:
const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET;

const oauth = new OAuth({
    consumer: {
        key: consumer_key,
        secret: consumer_secret,
    },
    signature_method: "HMAC-SHA1",
    hash_function: (baseString, key) =>
        crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

async function postRequest({
                              oauth_token,
                              oauth_token_secret
                          }) {

    const endpointURL = `https://api.twitter.com/2/tweets`;

    const token = {
        key: oauth_token,
        secret: oauth_token_secret
    };
    const authHeader = oauth.toHeader(oauth.authorize({
        url: endpointURL,
        method: 'POST'
    }, token));

    const data={
        "text": "This is a test!"
    };

    const req = await got.post(endpointURL, {
        json: data,
        responseType: 'json',
        headers: {
            Authorization: authHeader["Authorization"],
            'user-agent': "v2CreateTweetJS",
            'content-type': "application/json",
            'accept': "application/json"
        }
    });
    if (req.body) {
        return req.body;
    } else {
        return null;
    }
}

async function deleteRequest({ oauth_token, oauth_token_secret }) {
    const id = '1570455795862753280';
    const endpointURL = `https://api.twitter.com/2/tweets/${id}`;
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

async function getRequest({ oauth_token, oauth_token_secret }) {
    const tweetIDs = '1278747501642657792,1275828087666679809'; // Edit the Tweet IDs to look up
    const params = 'tweet.fields=lang,author_id&user.fields=created_at'; // Edit optional query parameters here

    const endpointURL = `https://api.twitter.com/2/tweets?ids=${tweetIDs}&${params}`;

    const token = {
        key: oauth_token,
        secret: oauth_token_secret,
    };

    const authHeader = oauth.toHeader(
        oauth.authorize(
            {
                url: endpointURL,
                method: "GET",
            },
            token
        )
    );

    // this is the HTTP header that adds bearer token authentication
    const res = await got(endpointURL, {
        headers: {
            Authorization: authHeader["Authorization"],
            'user-agent': "v2TweetLookupJS"
        }
    });

    if (res.body) {
        return res.body;
    } else {
        return null;
    }
}

app.delete('/DeleteTweet', async function (req, res) {
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

        res.send(response);
    } catch (e) {
        res.send(e)
    }

})

app.post('/CreateTweet',async function(req,res){
    const oAuthAccessToken = process.env.ACCESS_TOKEN;
    const oauthAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    // Make the request
    try {
        const response = await postRequest({
            oauth_token: oAuthAccessToken,
            oauth_token_secret: oauthAccessTokenSecret,
        });
        //console.log(response);
        console.dir(response, {
            depth: null,
        });
        res.send(response);
    } catch (e) {
        console.log(e)
        res.send(e)
    }

})

app.get('/ListTweets', async function (req, res) {
    const oAuthAccessToken = process.env.ACCESS_TOKEN;
    const oauthAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const response = await getRequest({
        oauth_token: oAuthAccessToken,
        oauth_token_secret: oauthAccessTokenSecret,
    });
    console.dir(response, {
        depth: null
    });

    res.send(response)
})

let server = app.listen(8081, function () {
    let host = server.address().address
    let port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})