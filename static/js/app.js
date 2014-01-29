

var socket = io.connect('http://localhost');
socket.on('news', function (data) {
  console.log(data);
});



//inject angular file upload directives and service.
var app = angular.module('app', ['angularFileUpload']); 

//directive for scrolling down list everytime
app.directive('scrolldown', function() {
  return function(scope, element, attrs, $anchorScroll) {
    if (scope.$last){
      //window.alert("im the last!");
      //$anchorScroll();
      console.log(element.parent());
      location.hash = "#last";
    }
  };
})


app.controller('newsController', function($scope, $location, $anchorScroll, $http){
  $http.get('/api/elements').success(function(data){
    console.log(data);
    $scope.elements = data;
  });
  $scope.notifyPic = function(){
    socket.emit('newPicture');
  }

  $scope.gotoLast = function (){
    $location.hash('last');
    $anchorScroll();
  }

  socket.on('newPicture', function (data) {
    $scope.$apply(function(){
      $scope.elements.push({"ID":data.filename, "type":"img", "value":data.filename}); 
      $location.hash('last');
      $anchorScroll();
    })

  });
});



//---------------------------
//  Upload
//---------------------------

var uploadController = [ '$scope', '$http','$upload', '$timeout', function($scope, $http, $upload,$timeout) {
  $scope.fileReaderSupported = window.FileReader != null;
  $scope.uploadRightAway = true;
  $scope.changeAngularVersion = function() {
    window.location.hash = $scope.angularVersion;
    window.location.reload(true);
  }
  $scope.hasUploader = function(index) {
    return $scope.upload[index] != null;
  };
  $scope.abort = function(index) {
    $scope.upload[index].abort(); 
    $scope.upload[index] = null;
  };


  $scope.onFileSelect = function($files) {
    $scope.selectedFiles = [];
    $scope.progress = [];
    if ($scope.upload && $scope.upload.length > 0) {
      for (var i = 0; i < $scope.upload.length; i++) {
        if ($scope.upload[i] != null) {
          $scope.upload[i].abort();
        }
      }
    }
    $scope.upload = [];
    $scope.uploadResult = [];
    $scope.selectedFiles = $files;
    $scope.dataUrls = [];
    for ( var i = 0; i < $files.length; i++) {
      var $file = $files[i];
      if (window.FileReader && $file.type.indexOf('image') > -1) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL($files[i]);
        function setPreview(fileReader, index) {
          fileReader.onload = function(e) {

            $timeout(function() {
              $scope.dataUrls[index] = e.target.result;
            });
            
          }
        }
        setPreview(fileReader, i);
      }
      $scope.progress[i] = -1;
      if ($scope.uploadRightAway) {
        $scope.start(i);
      }
    }
  }

  $scope.howToSend = 1;


  $scope.start = function(index) {
    $scope.progress[index] = 0;
    if ($scope.howToSend == 1) {
      $scope.upload[index] = $upload.upload({
        url : '/api/upload',
        method: $scope.httpMethod,
        file: $scope.selectedFiles[index],
        fileFormDataName: 'myFile'
      }).then(function(response) {
        $scope.uploadResult.push(response.data.result);
      }, null, function(evt) {
        $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
      });
    } else {
      var fileReader = new FileReader();
      fileReader.readAsArrayBuffer($scope.selectedFiles[index]);
      fileReader.onload = function(e) {
        $scope.upload[index] = $upload.http({
          url: '/api/upload',
          headers: {'Content-Type': $scope.selectedFiles[index].type},
          data: e.target.result
        }).then(function(response) {
          $scope.uploadResult.push(response.data.result);
        }, null, function(evt) {
          // Math.min is to fix IE which reports 200% sometimes
          $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
      }
    }
  }

}];



