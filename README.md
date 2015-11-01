<img alt="logo" align="right" src="https://raw.github.com/smaxwellstewart/lummox/master/images/logo.png" />

<img alt="lummox" src="https://raw.github.com/smaxwellstewart/lummox/master/images/lummox.png" />

**version:** (in dev) <br/>
**dev board:** [https://trello.com/b/KDHJ89EQ](https://trello.com/b/KDHJ89EQ)

A user service designed for SOA systems.

### Responsiblities

- Create, read, update and delete of users.
- Issuing JWT refresh and access tokens.

[![Build Status](https://travis-ci.org/smaxwellstewart/lummox.svg?branch=master)](https://travis-ci.org/smaxwellstewart/lummox)
[![Coverage Status](https://coveralls.io/repos/smaxwellstewart/lummox/badge.svg?branch=master&service=github)](https://coveralls.io/github/smaxwellstewart/lummox?branch=master)

# Goals

- To create a user service for distributed SOA systems.
- Create a rock solid, scalable and highly configurable API.
- Provide a simple authentication and authorization mechanism when extending the system to other services.
- Convenient UI for managing users.
- Quick to deploy.

## Config Options

The following options can be configured in `server/config/config.js`:

- `port` - port application runs from.
- `server` - A [hapi](https://github.com/hapijs/hapi) `server` [configuration](https://github.com/hapijs/hapi/blob/master/API.md#new-serveroptions) object. See docs for full details.
- `api` - api configuration object:
  - `prefix` - prefix to path of API routes.
  - `version` - version added to path of API routes.
- `mongoUri` - A mongodb connection URI.
- `jwt` - Options for configuring generating JWT tokens.
  - `key` - This is a **secret** key all tokens are signed and verified with.
  - `expiresIn` - This is the amount of minutes access tokens last for.
  - `verifyOptions` - A [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) `.verify` options object. See docs for full details.
- `auth` - auth configuration object:
 - `scopes` - List of allowed scopes.
 - `getAll` - A [hapi](https://github.com/hapijs/hapi) `route` auth [configuration](https://github.com/hapijs/hapi/blob/master/API.md#route-options) for the get all users API route.
 - `getOne` - A [hapi](https://github.com/hapijs/hapi) `route` auth [configuration](https://github.com/hapijs/hapi/blob/master/API.md#route-options) for the get a single user API route.
 - `update` - A [hapi](https://github.com/hapijs/hapi) `route` auth [configuration](https://github.com/hapijs/hapi/blob/master/API.md#route-options) for the update user API route.
 - `delete` - A [hapi](https://github.com/hapijs/hapi) `route` auth [configuration](https://github.com/hapijs/hapi/blob/master/API.md#route-options) for the delete user API route.
 - `getScopes` - A [hapi](https://github.com/hapijs/hapi) `route` auth [configuration](https://github.com/hapijs/hapi/blob/master/API.md#route-options) for the get user scopes API route.
- `saltRounds` - The amount of rounds passwords will be salted for during bcrypt hashing.
- `swaggerOptions` - A hapi-swagger plugin  [options](https://github.com/glennjones/hapi-swagger#options) object. See docs for full details.

## API

### Users

**GET** /*prefix*/*version*/users - Get all user's in system.

**GET** /*prefix*/*version*/users/{id} - Get a single user in the system.

**POST** /*prefix*/*version*/users - Create a user.

**PUT** /*prefix*/*version*/users/{id} - Update a user in the system.

**DELETE** /*prefix*/*version*/users/{id} - Delete a user in the system.

### Scopes

**GET** /*prefix*/*version*/users/scopes - Get all allowed user scopes.

### Tokens

**POST** /*prefix*/*version*/tokens/refresh - Create a new refresh token.

**POST** /*prefix*/*version*/tokens/access - Create a new refresh token.

## Authentication Workflow

### 1. Create a User

When a new user is created the password field is Bcrypted.  The scope field is an array
of access scopes that will be added to access tokens when the user generates one. The list of allowed
scopes can be configured in `server/config/config.js`.

##### Request

**POST** /api/v1/users

```JSON
{
  "username": "l337",
  "email": "email@example.com",
  "password":"123456",
  "scope": ["admin"],
  "active": true
}
```

##### Response

```JSON
{
  "_id": "562e689ca8b13f3b2f6fbeef",
  "username": "l337",
  "email": "email@example.com",
  "password":"123456",
  "scope": ["admin"],
  "active": true
}
```

### 2. Generate a Refresh Token

The user's credentials are supplied to generate a JWT refresh token. This token is not used directly for accessing protected routes, instead it is used to generate new access tokens.

The refresh token is meant as a long lived token, and as such has a unique id attached to it. This id is also attached to the user, allowing for revocation of refresh tokens at any point.

Example call:

##### Request

**POST** /api/v1/tokens/refresh

```JSON
{
  "username": "l337",
  "password":"123456"
}
```

##### Response

```Json
{
  "token": "YOUR.REFRESH.TOKEN"
}
```

### 3. Get an Access Token

This is where you get an access token using your refresh token. The user's scope is attached to the token at this stage.


##### More Secure Request

**POST** /api/v1/tokens/access

*Header*
`Authorization: YOUR.REFRESH.TOKEN`

##### Less Secure Request

**POST** /api/v1/tokens/access?token=YOUR.REFRESH.TOKEN

##### Response

```Json
{
  "token": "YOUR.ACCESS.TOKEN"
}
```

You can now use this token to access protected routes with moderately complex access control use cases, i.e any user, admins only, admins AND managers, only specific users, etc...

## How to Deploy

The service has been designed to be very straightforward to deploy to a platform like Heroku or Dokku. Simply grab the code, configure the service to your liking and push.

Here's an example of how to do it for Heroku.

```bash
git clone https://github.com/smaxwellstewart/lummox
cd lummox
vim server/config/config.js
git commit -am 'configured lummox to my liking'
heroku create
heroku config:set MONGO_URI=mongodb://localhost:27017/lummox
heroku config:set JWT_SECRET=changeme
git push heroku master
```

### Hardening

Once deployed rate limiting the token routes is a good idea to protect against denial of service attacks and limit the amount of access tokens being generated.

## How to Use with Other Services

Other services can be authenticated without need for a db lookup. The JSON web tokens are used to transmit claims about a user.

There is definitely a catch to this model, which is that session info embedded in your JSON Web Token is limited in size. You can store a useful amount of data but they shouldn't be too huge. A way to get around this for services which need more session is to have another service like a session/profile service to return extra data about a user, this can increase latency by adding another round trip.

As always understand your use case and what this solution offers before implementing anything.

## Stack: HAM

**H is for Hapi** - Hapi is an awesome node.js framework for creating robust APIs.

**A is for Angular** - Angular is a great way to quickly build powerful frontend applications.

**M is for MongoDB** - Mongo is a great NoSQL database that handles JSON natively, perfect fit for Node.js projects.
