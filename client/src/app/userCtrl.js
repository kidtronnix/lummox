app.controller('userCtrl', [ '$scope', '$http','$location', 'growl',
	function($scope, $http, $location,  growl){

		$scope.uploadfile = function(){
			$http.post('/upload',$scope.file).then(function(data){
				console.log('success');
				// $scope.sectionList = data;
			}).catch(function(error){
				growl.addErrorMessage('oops! Something went wrong');
			})
		}

		$scope.onFileSelect = function($files){
			$scope.file = $files[0].name; 
			console.log($scope.file);
		}
	}]
)