User Microservice
========================

A user service designed as a microservice that is responsible for:

- CRUD of users.
- Issuing refresh and access tokens.

### *API*

###### *Create a User*

**POST:** http://localhost:8000/api/users

```json
{
	"username": "kidtronnix",
	"email": "kidtronnix@kidtronnix.com",
	"fullname": "Kid Tronnix",
	"password": "pass123",

}
```

###### *Get All Users*

**GET:** http://localhost:8000/api/users

###### *Get User By userId*

**GET:**  http://localhost:8000/user/{userId}


###### *Update User By userId*

PUT: http://localhost:8000/user/{userId}

{
	"username": "gaurav@cronj.com"
}

###### *Delete User By userId*

DELETE: http://localhost:8000/user/{userId}



### Other Usefull Link

[Visit Blog For Explanation] (http://cronj.com/blog/hapi-mongoose/)

[Can also look into Hapi File Upload And Download for all type] (https://github.com/Cron-J/Hapi-file-upload-download)

[Express-Mongoose-Angular] (https://github.com/Cron-J/Express-file-upload-download)

[JWT-Hapi-Mongoose-Mongodb-with-email-verification-and-forgot-password] (https://github.com/Cron-J/JWT-Hapi-Mongoose-Mongodb-with-email-verification-and-forgot-password)
