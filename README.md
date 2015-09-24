User Microservice
========================

[![Build Status](https://travis-ci.org/smaxwellstewart/lummox.svg?branch=master)](https://travis-ci.org/smaxwellstewart/lummox)
[![Coverage Status](https://coveralls.io/repos/smaxwellstewart/user-microservice/badge.svg?branch=master&service=github)](https://coveralls.io/github/smaxwellstewart/user-microservice?branch=master)

**version:** (in dev) <br/>
**dev board:** [https://trello.com/b/KDHJ89EQ](https://trello.com/b/KDHJ89EQ)

A user service designed as a microservice that is responsible for:

- CRUD of users.
- Issuing JWT refresh and access tokens.

## What does microservice mean?

Basically, the users for a system can be managed in their own discrete service with thier own seperate db. This makes sense as a db with users details has different needs to a stats db.

## Features 

- Plug 'n' Play
- Extendable. .
- Customisable user scopes/permissions

## How to Extend?

Other services can be authenticated without need for a db lookup. The Json web tokens used to authenticate with other services enable stateless session.
