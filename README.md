# Devcamper API

> An Nodejs API extracted from NodeJS_Learn for deployment, source code can be found in Nodejs_Learn as well.
>
> Backend API for DevCamper application, which is a bootcamp directory website

## Usage

Rename "config/config.env.env" to "config/config.env" and update the values/settings to your own

## Install Dependencies

```
npm install
```

## Run App

```
# Run in dev mode
npm run dev

# Run in prod mode
npm start
```

- Version: 1.0.0
- License: MIT

---

## Environment Set up

```bash
npm i express dotenv mongoose colors morgan slugify express-fileupload jsonwebtoken bcryptjs nodemailer express-mongo-sanitize helmet xss-clean express-rate-limit hpp cors
```

- `express`: web framework

- [`dotenv`](https://github.com/motdotla/dotenv): Dotenv is a zero-dependency module that loads environment variables from a `.env` file into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env)

- [`morgan`](https://github.com/expressjs/morgan): a third party middleware function working as a logger

- [`colors`](https://github.com/marak/colors.js/): a third party package which can change color and styles of logging message in node.js console

- [`mongoose`](https://mongoosejs.com/): MongoDB object modeling designed to work in an asynchronous environment.

- [`slugify`](https://www.npmjs.com/package/slugify): Change certain fields to a more user-friendly version (**from Name to Slug**)

  - ```json
    {
      "name": "Devcentral Bootcamp",
      "slug": "devcentral-bootcamp"
    }
    ```

- [`node-geocoder`](https://www.npmjs.com/package/node-geocoder): Node library for geocoding and reverse geocoding. Can be used as a nodejs library

  - add some environmental variables according to provider of geo infomation and API keys.

- [`express-fileupload`](https://www.npmjs.com/package/express-fileupload): A third-party package which makes file uploads in Node.js easier

- [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken): A third-party package which encrypt certain information for login purposes

- [`bcryptjs`](https://www.npmjs.com/package/bcryptjs): A third-party package which allows us to encrypt users' password

  > Besides incorporating a salt to protect against rainbow table attacks, bcrypt is an adaptive function: over time, the iteration count can be increased to make it slower, so it remains resistant to brute-force search attacks even with increasing computation power.

- [`cookie-parser`](https://www.npmjs.com/package/cookie-parser): A third-party package which parse the cookie, so we can read data from it

- [`nodemailer`](https://www.npmjs.com/package/nodemailer): used for sending emails when user forgot their password

  > Why?
  >
  > Object keys starting with a `$` or containing a `.` are _reserved_ for use by MongoDB as operators. Without this sanitization, malicious users could send an object containing a `$` operator, or including a `.`, which could change the context of a database operation. Most notorious is the `$where` operator, which can execute arbitrary JavaScript on the database.
  >
  > The best way to prevent this is to sanitize the received data, and remove any offending keys, or replace the characters with a 'safe' one.

- [`helmet`](https://www.npmjs.com/package/helmet): Helps to secure Express apps by setting various HTTP headers.

- [`xss-clean`](https://www.npmjs.com/package/xss-clean): Prevent possible embedded harmful code (prevent xss attacks)

  - name="Post1 `<script>some js code</script>`", if the name get embedded to the webpage, the script will be ran on that page, one way to prevent this from happening is to clean the input.

- [`express-rate-limit`](https://www.npmjs.com/package/express-rate-limit): Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.

- [`hpp`](https://www.npmjs.com/package/hpp): Express middleware to protect against HTTP Parameter Pollution attacks

- [`cors`](https://www.npmjs.com/package/cors): CORS is a node.js package for providing a [Connect](http://www.senchalabs.org/connect/)/[Express](http://expressjs.com/) middleware that can be used to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) with various options.

```bash
npm i -D nodemon
```

---

## Route define

1. Create **routes** in **seperate folder** and imported them back to `server.js`

   ```javascript
   // Route files
   const bootcamps = require("./routes/bootcamps");
   ```

2. Create **controllers** for **each route** for specific action implementation

3. Deconstruct API handling functions in **route files** from **controller files**.

   ```javascript
   const {
     getBootCamps,
     getBootCamp,
     createBootCamp,
     updateBootCamp,
     deleteBootCamp,
   } = require("../controllers/bootcamps");
   ```

   _Where `getBootCamps`, `getBootCamp` ... are specific action implementations_

4. Pdf

---

## Model:

### Bootcamp.js:

### Course.js

---

## Middleware functions:

### async.js

### logger.js

### error.js

---

## Tips:

1. In express, when editing the response from a server, `res.send() can send json objects as well, express will automatically convert it`. However, usually we use `res.json()` for json objects.

2. Mongoose model schema:

   1. Slug: a URL friendly string
   2. if extra `key:value` pairs sent within the request body, the mongoose schema will only take account of `key:value` pairs previously set

3. Mongoose preset middle ware functions:

   1. ```javascript
      // Create bootcamp slug from the name
      BootcampSchema.pre("save", function (next) {
        console.log("Slugify ran", this.name);
        next();
      });
      ```

   2. `pre`: runs this middleware function before the operation (in this case, before a document is saved into the database)

   3. `function(){}`: does not use an arrow function here since arrow function handles `this` keyword differently

4. `populate()` in Mongoose:

   1. populate(): used in Course model

      > Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s). We may populate a single document, multiple documents, a plain object, multiple plain objects, or all objects returned from a query.

      1. fetch some columns of information about the associated bootcamp

   2. Virtual populate(): used in Bootcamp model

      > In Mongoose, a virtual is a property that is **not** stored in MongoDB. Virtuals are typically used for computed properties on documents.

      1. fetch all courses related to the bootcamp

5. why we use course.user.toString() in course controller but not bootcamp controller

   1. `course.user` returns an `ObjectID`, which can not be compared to string id by `!==`
   2. `req.params.id` and `req.user.id` both return string type so we can compare them simply through `!==`

6. If a query hanging at an endpoint, you better check the port it is communicating with. (I was debugging for a long time with `sendMail()` function provided by `nodeMail`, and it turned out to be a **wrong port** in `config file`.)

---

## Problem:

1. redirect routes (from bootcamp to courses) having trouble using middleware fucntions.
2. Aggregated functions not working when removing the last course or review. should take care this boundary case
3. Does cookies must to have a expire time?
4. Why does NOSQL injection works?
