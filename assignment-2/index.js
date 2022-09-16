import {got} from 'got';
import crypto from 'crypto';
import OAuth from "oauth-1.0a";
import dotenv from 'dotenv';
import express from 'express';

const app=new express();

dotenv.config()

// The code below sets the consumer key and consumer secret from your environment variables
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
                           },data) {

    const endpointURL = `https://api.twitter.com/2/tweets`;

    const token = {
        key: oauth_token,
        secret: oauth_token_secret
    };
    const authHeader = oauth.toHeader(oauth.authorize({
        url: endpointURL,
        method: 'POST'
    }, token));

    const data_tweet=data;

    const req = await got.post(endpointURL, {
        json: data_tweet,
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

async function deleteRequest({ oauth_token, oauth_token_secret },id) {
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

async function getRequest({ oauth_token, oauth_token_secret}, userId){
    const endpointURL = `https://api.twitter.com/2/users/${userId}/tweets`;

    console.log(endpointURL)
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

app.delete('/Tweet/:id', async function (req, res) {
    try {
        const oAuthAccessToken = process.env.ACCESS_TOKEN;
        const oauthAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        var tweet_id=req.params['id'];
        // Make the request
        const response = await deleteRequest({
            oauth_token: oAuthAccessToken,
            oauth_token_secret: oauthAccessTokenSecret,
        },tweet_id);
        console.dir(response, {
            depth: null,
        });

        res.send(response);
    } catch (e) {
        res.send(e)
    }

})
app.use(express.json());
app.post('/Tweet',async function(req,res){
    const oAuthAccessToken = process.env.ACCESS_TOKEN;
    const oauthAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const data = req.body;
    // Make the request
    try {
        const response = await postRequest({
            oauth_token: oAuthAccessToken,
            oauth_token_secret: oauthAccessTokenSecret,
        },data);
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

// userId='1570098561924370432'
app.get('/RecentTweets/:userId', async function (req, res) {
    var userId=req.params['userId'];

    const oAuthAccessToken = process.env.ACCESS_TOKEN;
    const oauthAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const response = await getRequest({
        oauth_token: oAuthAccessToken,
        oauth_token_secret: oauthAccessTokenSecret,
    }, userId);
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