app.controller('userCtrl', [ '$scope', '$http','$location', 'growl', 'UserService',
	function($scope, $http, $location,  growl, UserService){

	if(!localStorage.getItem("refreshToken")) {
		window.location = "/login"
	}

	UserService.getScopes(function(err, response) {
		if(err) return;
		for(var i = 0; i < response.data.length; i++) {
			var scope = response.data[i];
			$('.frm-scopes').append(' <option value="'+scope+'">'+scope+'</option>')
		}
		$('.frm-scopes').select2();

		var claimsBase64 = localStorage.getItem('accessToken').split('.')[1];
		var claims = {};
		claims = JSON.parse(atob(claimsBase64));

		UserService.getOne(claims.sub, function(err, response) {
			if(err) return;
			$('.user-username').html(response.data.username);
		});
	});




	UserService.getAll(function(err, response) {
		var userTable = $('#user-table').WATable({
				columnPicker: false,
				dataBind:true,
				pageSize: 10,
				pageSizes: [10,25,50,100,200,1000],
				filter: true,
				sorting: true,
				actions: {
					custom: [
						$('<a id="user-create-btn"><i class="fa fa-user"></i> Create User<a>;')
					]
				},
				tableCreated: function(data) {
						// console.log('table created');
						// console.log(data);
						$('.user-table-loading').hide();

						$("#user-create-btn").on("click", function () {
							$('.error-box').hide();
							$('#createUserModal').modal('show');
						});

						$( "#createUser" ).click(function() {
						  var payload = {
								email: $('#createUserModal .frm-email').val(),
								username: $('#createUserModal .frm-username').val(),
								password: $('#createUserModal .frm-password').val(),
						    active: $('#createUserModal .frm-active').prop('checked'),
								scope: $('#createUserModal .frm-scopes').select2("val")
						  }
							UserService.create(payload, function(err, response) {
								if (err) return displayError(response);
								userTable.getData().rows.push(response.data);
								Platform.performMicrotaskCheckpoint();
								$('#createUserModal').modal('hide');
							});
						});

						$( "#deleteUser" ).click(function() {
							var id = $('#editUserModal .frm-userId').val();
							var rowId = $('#rowId').val();

							if (confirm('Are you sure you want to delete this user?')) {
								UserService.delete(id, function(err, response) {
									if (err) return displayError(response);
									userTable.getData().rows.splice(rowId, 1);
									Platform.performMicrotaskCheckpoint();
									$('#editUserModal').modal('hide');
								});
							}

						});

						$( "#editUser" ).click(function() {
						  var payload = {
								email: $('#editUserModal .frm-email').val(),
								username: $('#editUserModal .frm-username').val(),
						    active: $('#editUserModal .frm-active').prop('checked'),
								scope: $('#editUserModal .frm-scopes').select2("val")
						  }

							var id = $('#editUserModal .frm-userId').val();
							var rowId = $('#rowId').val();
							UserService.update(id, payload, function(err, response) {
								if (err) return displayError(response);
								$.extend(userTable.getData().rows[rowId], response.data);
								Platform.performMicrotaskCheckpoint();
								$('#editUserModal').modal('hide');
							});
						});
				},
				rowClicked: function(data) {      //Fires when a row or anything within is clicked (Note. You need a column with the 'unique' property).
						// console.log('row clicked');   //data.event holds the original jQuery event.
						// console.log(data);
						$('.error-box').hide();
						$(".frm-scopes option").attr('selected', false);
						$('#rowId').val(data.index);
						$('.frm-userId').val(data.row._id);
						$('.frm-username').val(data.row.username);
						$('.frm-email').val(data.row.email);
						$('.frm-active').prop('checked', data.row.active);
						$('.frm-jti').val(data.row.jti);
						if(data.row.scope) {
							var scopes = data.row.scope.split(' - ');
							$(".frm-scopes").val(scopes).trigger("change");
						}
						$('#editUserModal').modal('show');
				},
		}).data('WATable');
		var cols = {
				_id: {
					index: 10,
					type: "number",
					unique: true,
					friendly: "User ID",
				},
				username: {
						index: 20,
						type: "string",
						friendly: "Username",
				},
				email: {
						index: 30,
						type: "string",
						friendly: "Email"
				},
				scope: {
						index: 40,
						type: "string",
						friendly: "Scopes"
				},
				active: {
						index: 50,
						type: "bool",
						friendly: "Active",
				},
				jti: {
						index: 45,
						type: "string",
						friendly: "Refresh Token ID",
				},
				createdAt: {
						index: 60,
						type: "date",
						friendly: "Created At",
						sortOrder: "desc",
				},
		};

		var data = {
			cols: cols,
			rows: response.data
		}

		userTable.setData(data);
	});




	function getParameterByName(name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function displayError(err) {
		console.error(err);
		var message = err.message.match(/\[(.*?)\]/);
		console.log(message);
		if (message) {
			message = message[1];
		} else {
			message = err.message;
		}
		$('.error-status').html(err.error);
		$('.error-message').html(message);
		$('.error-box').show();
	}
	}]
)
