angular.module('elastichat.services', [])

.factory('Chat', function($state,$rootScope,$http,$ionicScrollDelegate) {

  var users = {};
  var messages = [];

  var baseUrl, socket;
  
  //baseUrl = 'http://192.168.11.141:3000';
  baseUrl = 'http://eztidy.com:3000';
  
  socket = io(baseUrl);

  var functions = {
	login: function(authData) {
		 socket.emit('loginUser',authData , function (data) {
			  console.log(data);
			  if(data.success === 1){
				   users.userName= data.UserName;
					users.userId= data.UserId;
					users.userPic = 'http://ionicframework.com/img/docs/venkman.jpg';
					users.toUserPic = 'http://ionicframework.com/img/docs/venkman.jpg';
					users.toUserName = "Jai";
					users.toUserId = 1;
					if(data.UserId === 1)
						users.toUserId = 2;
					
					$state.go('UserMessages');
			  }else{
				  var alertPopup = $ionicPopup.alert({
				       title: 'Login',
				       template: 'Invalid user.'
				     });
				     alertPopup.then(function(res) {
				       console.log('Thank you for not eating my delicious ice cream cone');
				     });
			  }
		  });
	},	  
    all: function() {
      return users;
    },
    get: function(friendId) {
      return friends[friendId];
    },
    getMessages: function(){
      return messages;
    },
    
    sendMessage: function(msg){
     var jsonData =JSON.stringify({"chatJobId":55,"chatRequestId": 52,"toId":users.toUserId ,"toName": users.toUserName,"message":msg.text,"fromId":1,"fromName":users.userName,"chatFromImage": ""});
   console.log(jsonData);
     messages.push(msg);
      //socket.emit('new message', msg, username);
  		socket.emit('privateMessage',jsonData,function(a){
  			console.log(a);
  		});
    },
    getUsername: function(){
      return users.userName;
    },
    setUsername: function(newUsername){
      username = newUsername;
      socket.emit('add user', username);
    },
    getUsernames: function(){
      return $http.get(baseUrl+'/usernames');
    },
    
  };

  socket.on('privateMessage', function(data){
	   console.log(data);
	    
	  var message = {
				toId: data.toId,
				text: data.message
		};
		message._id = new Date().getTime(); // :~)
		message.date = new Date();
		message.username = data.fromName;
		message.userId = data.fromId;
		message.pic = users.userPic;
		console.log(message);
		
	  $rootScope.$apply(function () {
	      messages.push(message);
	      users.toUserName = data.fromName;
	      $ionicScrollDelegate.scrollBottom(true);
	    });
	});
 // socket.emit("writingStatus", JSON.stringify({"userId": CHAT_APP.toId,"status": 0}));             
 
  return functions;

})

/*.factory('MockService', ['$http', '$q',function($http, $q) {
	var me = {};

	me.getUserMessages = function(d) {
		var deferred = $q.defer();

		setTimeout(function() {
			deferred.resolve(getMockMessages());
		}, 1500);

		return deferred.promise;
	};

	me.getMockMessage = function() {
		return false;
		return {
			userId: '534b8e5aaa5e7afc1b23e69b',
			date: new Date(),
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
		};
	}

	return me;
}
]);
*/

