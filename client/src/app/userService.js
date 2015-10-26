app.factory('UserService', function($http) {
  var self = {};
  var attempts = 0;
  var getAccessToken = function(cb) {
    var req = $http({ url: '/tokens/access', method: 'POST', headers: { Authorization: localStorage.getItem('refreshToken') } });
    req.success(function(token, status, headers, config) {
      localStorage.setItem('accessToken', token.token);
      console.log('Access token', token.token);
      attempts = 0;
      cb();
    })
    .error(function(data, status, headers, config) {
      console.log('Couldnt get access token');
      console.log(status, data);
      attempts++;

      if(status == 401) {
        localStorage.removeItem("refreshToken")
        console.log('BAD REFRESH TOKEN');
        window.location = '/login';
        return;
      }
      if (attempts > 5) {
        $.notify("Error generating access token","error");
        localStorage.removeItem("refreshToken");
        window.location = '/login';
        return;
      }
      getAccessToken();
    });
  }

  self.getOne = function(id, cb) {
		var req = $http.get('/users/'+id, { headers: { Authorization: localStorage.getItem('accessToken')  } });
		req.success(function(user, status, headers, config) {
			user.createdAt = dateFromObjectId(user._id);
			user.scope = user.scope.join(' - ');
			cb(null, { statusCode: status, data: user });
		})
		.error(function(data, status, headers, config) {
      if(status == 401) {
        return getAccessToken(function() {
          self.getOne(id, cb);
        });
      }
			cb(status, data);
		});
  }

  self.getAll = function(cb) {
		var req = $http.get('/users', { headers: { Authorization: localStorage.getItem('accessToken')  } });
		req.success(function(users, status, headers, config) {
			var len = users.length;
			for(var i = 0; i < len; i++) {
				users[i].createdAt = dateFromObjectId(users[i]._id);
				users[i].scope = users[i].scope.join(' - ');
			}
			cb(null, { statusCode: status, data: users });
		})
		.error(function(data, status, headers, config) {
      if(status == 401) {
        return getAccessToken(function() {
          self.getAll(cb);
        });
      }
			cb(status, data);
		});
  }

	self.getScopes = function(cb) {
		var req = $http.get('/users/scopes', { headers: { Authorization: localStorage.getItem('accessToken')  } });
    req.success(function(scopes, status, headers, config) {
      cb(null, { statusCode: status, data: scopes });
    })
    .error(function(data, status, headers, config) {
      if(status == 401) {
        return getAccessToken(function() {
          self.getScopes(cb);
        });
      }
      cb(status, data);
    });
	}

	self.create = function(payload, cb) {
		var req = $http.post('/users', payload, { headers: { Authorization: localStorage.getItem('accessToken')  } });
		req.success(function(user, status, headers, config) {
			user.createdAt = dateFromObjectId(user._id);
			user.scope =	user.scope.join(' - ');
			cb(null, { statusCode: status, data: user });
		})
		.error(function(data, status, headers, config) {
      if(status == 401) {
        return getAccessToken(function() {
          self.create(payload, cb);
        });
      }
			cb(status, data);
		});
	}

	self.update = function(id, payload, cb) {
		var req = $http.put('/users/'+id, payload, { headers: { Authorization: localStorage.getItem('accessToken')  } });
		req.success(function(user, status, headers, config) {
			user.scope =	user.scope.join(' - ');
			cb(null, { statusCode: status, data: user });
		})
		.error(function(data, status, headers, config) {
      if(status == 401) {
        return getAccessToken(function() {
          self.update(id, payload, cb);
        });
      }
			cb(status, data);
		});
	}

	self.delete = function(id, cb) {
		var req = $http.delete('/users/'+id, { headers: { Authorization: localStorage.getItem('accessToken')  } });
		req.success(function(msg, status, headers, config) {
			cb(null, { statusCode: status, data: msg });
		})
		.error(function(data, status, headers, config) {
      if(status == 401) {
        return getAccessToken(function() {
          self.delete(id, cb);
        });
      }
			cb(status, data);
		});
	}

  var dateFromObjectId = function (objectId) {
  	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
  };

  return self;
});


/*
	 * ```js
	 *   // Simple GET request example :
	 *   $http.get('/someUrl').
	 *     success(function(data, status, headers, config) {
	 *       // this callback will be called asynchronously
	 *       // when the response is available
	 *     }).
	 *     error(function(data, status, headers, config) {
	 *       // called asynchronously if an error occurs
	 *       // or server returns response with an error status.
	 *     });
	 * ```
	 */
