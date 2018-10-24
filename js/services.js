angular.module('app.services', [])


.factory('fireBaseData', function($firebase) {
	var ref = new Firebase("https://crent-fd8df.firebaseio.com/"),
    refCart = new Firebase("https://crent-fd8df.firebaseio.com/cart"),
    refView = new Firebase("https://crent-fd8df.firebaseio.com/view"),
    refUser = new Firebase("https://crent-fd8df.firebaseio.com/users"),
    refCategory = new Firebase("https://crent-fd8df.firebaseio.com/category"),
    refOrder = new Firebase("https://crent-fd8df.firebaseio.com/orders"),
    refFeatured = new Firebase("https://crent-fd8df.firebaseio.com/featured"),
    refList = new Firebase("https://crent-fd8df.firebaseio.com/list");
  return {
    ref: function() {
      return ref;
    },
    refCart: function() {
      return refCart;
      console.log(refCart);
    },
    refView: function() {
      return refView;
    },
    refUser: function() {
      return refUser;
    },
    refCategory: function() {
      return refCategory;
    },
    refOrder: function() {
      return refOrder;
    },
    refFeatured: function() {
      return refFeatured;
    },
    refList: function() {
      return refList;
    }
  }
})


.factory('sharedUtils',['$ionicLoading','$ionicPopup', function($ionicLoading,$ionicPopup){


    var functionObj={};

    functionObj.showLoading=function(){
      $ionicLoading.show({
        content: '<i class=" ion-loading-c"></i> ', // The text to display in the loading indicator
        animation: 'fade-in', // The animation to use
        showBackdrop: true, // Will a dark overlay or backdrop cover the entire view
        maxWidth: 200, // The maximum width of the loading indicator. Text will be wrapped if longer than maxWidth
        showDelay: 0 // The delay in showing the indicator
      });
    };
    functionObj.hideLoading=function(){
      $ionicLoading.hide();
    };


    functionObj.showAlert = function(title,message) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
    };

    return functionObj;

}])




  .factory('sharedCartService', ['$ionicPopup','fireBaseData','$firebaseArray',function($ionicPopup, fireBaseData, $firebaseArray){

    var uid ;// uid is temporary user_id

    var cart={}; // the main Object


    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        uid=user.uid;
        cart.cart_items = $firebaseArray(fireBaseData.refCart().child(uid));
        cart.view_items = $firebaseArray(fireBaseData.refView().child(uid));
        cart.msg_items = $firebaseArray(fireBaseData.refUser().child(uid).child('messages'));
      }
    });




    //Add to Cart
    cart.view = function(item) {
      //check if item is already added or not
      fireBaseData.refView().child(uid).once("value", function(snapshot) {

        

          //if item is new in the cart
          fireBaseData.refView().child(uid).child(item.$id).set({    // set
            item_name: item.name,
            item_image: item.image,
            item_price: item.price,
            item_description: item.description,
            item_year: item.year,
            item_load: item.load,
            item_available: item.available,
          });
        
      });
    };

    cart.dropView=function(){
      fireBaseData.refView().child(uid).remove();
    };


    cart.add = function(item) {
      //check if item is already added or not
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {

        

          //if item is new in the cart
          fireBaseData.refCart().child(uid).child(item.$id).set({    // set
            item_name: item.name,
            item_image: item.image,
            item_price: item.price,
            item_qty: 1
          });
        
      });
    };

    cart.drop=function(item_id){
      fireBaseData.refCart().child(uid).child(item_id).remove();
    };

    cart.increment=function(item_id){

      //check if item is exist in the cart or not
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {
        if( snapshot.hasChild(item_id) == true ){

          var currentQty = snapshot.child(item_id).val().item_qty;
          //check if currentQty+1 is less than available stock
          fireBaseData.refCart().child(uid).child(item_id).update({
            item_qty : currentQty+1
          });

        }else{
          //pop error
        }
      });

    };

    cart.decrement=function(item_id){

      //check if item is exist in the cart or not
      fireBaseData.refCart().child(uid).once("value", function(snapshot) {
        if( snapshot.hasChild(item_id) == true ){

          var currentQty = snapshot.child(item_id).val().item_qty;

          if( currentQty-1 <= 0){
            cart.drop(item_id);
          }else{
            fireBaseData.refCart().child(uid).child(item_id).update({
              item_qty : currentQty-1
            });
          }

        }else{
          //pop error
        }
      });

    };

    cart.datepicker = function(item_id, datetimeValue){
      fireBaseData.refCart().child(uid).child(item_id).update({
        date: datetimeValue
      })
    }

    return cart;
  }])



.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}]);

