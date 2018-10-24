angular.module('app.controllers', [])

.controller('loginCtrl', function($scope,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
    $rootScope.extras = false;  // Menyembunyikan side nav menu

    // Ketika user logout lalu di arahkan ke login page
    // hapus history untuk mencegah user kembali ke page sebelumnya
    $scope.$on('$ionicView.enter', function(ev) {
      if(ev.targetScope !== $scope){
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
      }
    });




    //Cek user sudah login atau belum
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $ionicSideMenuDelegate.canDragContent(true); 
        $rootScope.extras = true;
        sharedUtils.hideLoading();
        $state.go('menu2', {}, {location: "replace"});

      }
    });


    $scope.loginEmail = function(formName,cred) {


      if(formName.$valid) {  // cek jika form sudah valid atau belum

          sharedUtils.showLoading();

          //Email
          firebase.auth().signInWithEmailAndPassword(cred.email,cred.password).then(function(result) {

              $ionicHistory.nextViewOptions({
                historyRoot: true
              });
              $rootScope.extras = true;
              sharedUtils.hideLoading();
              $state.go('menu2', {}, {location: "replace"});

            },
            function(error) {
              sharedUtils.hideLoading();
              sharedUtils.showAlert("Peringatan","Autentikasi Bermasalah");
            }
        );

      }else{
        sharedUtils.showAlert("Peringatan","Data tidak valid");
      }



    };


    $scope.loginFb = function(){
      //Facebook Login
    };

    $scope.loginGmail = function(){
      //Gmail Login
    };


})

.controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,
                                   $state,fireBaseData,$ionicHistory) {
    $rootScope.extras = false; // For hiding the side bar and nav icon

    $scope.signupEmail = function (formName, cred) {

      if (formName.$valid) {  // Check if the form data is valid or not

        sharedUtils.showLoading();

        //Main Firebase Authentication part
        firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {

            //Add name and default dp to the Autherisation table

            var result = firebase.auth().currentUser;

            result.updateProfile({
              displayName: cred.name,
              photoURL: "default_dp"
            }).then(function() {}, function(error) {});

            //Add phone number to the user table
            fireBaseData.refUser().child(result.uid).set({
              telephone: cred.phone,
              name: cred.name,
              email: cred.email
            });

            //Registered OK
            $ionicHistory.nextViewOptions({
              historyRoot: true
            });
            $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
            $rootScope.extras = true;
            sharedUtils.hideLoading();
            $state.go('menu2', {}, {location: "replace"});

        }, function (error) {
            sharedUtils.hideLoading();
            sharedUtils.showAlert("Peringatan","Tidak bisa daftar saat ini, coba lagi nanti");
        });

      }else{
        sharedUtils.showAlert("Peringatan","Data tidak valid");
      }

    }

  })

.controller('menu2Ctrl', function($scope,$rootScope,$ionicSideMenuDelegate,fireBaseData,$state,
                                  $ionicHistory,$firebaseArray,sharedCartService,sharedUtils,$snackbar,$ionicPopup,$filter, $ionicModal) {

  //Check if user already logged in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user_info=user; //Saves data to user_info
    }else {

      $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
      $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $rootScope.extras = false;
      sharedUtils.hideLoading();
      $state.go('tabsController.login', {}, {location: "replace"});

    }
  });

  // On Loggin in to menu page, the sideMenu drag state is set to true
  $ionicSideMenuDelegate.canDragContent(true);
  $rootScope.extras=true;

  // When user visits A-> B -> C -> A and clicks back, he will close the app instead of back linking
  $scope.$on('$ionicView.enter', function(ev) {
    if(ev.targetScope !== $scope){
      $ionicHistory.clearHistory();
      $ionicHistory.clearCache();
    }
  });



  $scope.loadMenu = function() {
    sharedUtils.showLoading();
    $scope.menu=$firebaseArray(fireBaseData.refList().orderByChild('available').equalTo('Tersedia'));
    //console.log($scope.menu)
    sharedUtils.hideLoading();
  }

  $scope.addToCart=function(item){
    sharedCartService.add(item);
    var options = {
      message:"Item Berhasil Ditambahkan",
      messageColor:"white",
      time:2000
    };
    $snackbar.show(options);
  };

  $scope.detail = function(item){
    $ionicPopup.show({
        template: '<p>Plat nomor: '+item.name+'</p>' +
                  '<p>Harga: '+$filter('currency')(item.price, "IDR ", 0)+' per jam</p>' +
                  '<p>Status: '+item.available+'</p>' +
                  '<p>Tahun: '+item.year+'</p> ' +
                  '<p>Muatan: '+item.load+' ton</p>' +
                  '<p><strong>'+item.description+'</strong></p>',
        title: 'Detail',
        subTitle: 'Detail crane',
        scope: $scope,
        buttons: [
          { text: 'Tutup', type: 'button-positive', },
          // {
          //   text: '<b>Cetak</b>',
          //   type: 'button-positive',
          //   onTap: function(e) {
              
          //   }
          // }
        ]
    });
  }

  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.searchCrane = function (item) {
     
      $scope.modal.show();
      
  };

})

.controller('offersCtrl', function($scope,$rootScope) {

    //We initialise it on all the Main Controllers because, $rootScope.extra has default value false
    // So if you happen to refresh the Offer page, you will get $rootScope.extra = false
    //We need $ionicSideMenuDelegate.canDragContent(true) only on the menu, ie after login page
    $rootScope.extras=true;
})

.controller('indexCtrl', function($scope,$rootScope,sharedUtils,$ionicHistory,$state,$ionicSideMenuDelegate,sharedCartService,fireBaseData) {

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.user_info=user; //Saves data to user_info

        //Only when the user is logged in, the cart qty is shown
        //Else it will show unwanted console error till we get the user object
        $scope.get_total= function() {
          var total_qty=0;
          // for (var i = 0; i < sharedCartService.cart_items.length; i++) {
          //   total_qty += sharedCartService.cart_items[i];
          // }

          total_qty = sharedCartService.cart_items.length;
          return total_qty;
        };

        $scope.notif_count = function(){
          var count = 0

          for(var i = 0; i < sharedCartService.msg_items.length; i++ ){
            var count_array = [];

            if(sharedCartService.msg_items[i].status == 'unread'){
              count_array.push(sharedCartService.msg_items[i]);
              count += count_array.length
            }
          
          }

          return count;
        }


      }else {

        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }
    });

    $scope.logout=function(){

      sharedUtils.showLoading();

      // Main Firebase logout
      firebase.auth().signOut().then(function() {


        $ionicSideMenuDelegate.toggleLeft(); //To close the side bar
        $ionicSideMenuDelegate.canDragContent(false);  // To remove the sidemenu white space

        $ionicHistory.nextViewOptions({
          historyRoot: true
        });


        $rootScope.extras = false;
        sharedUtils.hideLoading();
        $state.go('tabsController.login', {}, {location: "replace"});

      }, function(error) {
         sharedUtils.showAlert("Peringatan","Logout Gagal")
      });

    }
    

  })

.controller('myCartCtrl', function($scope,$rootScope,$state,sharedCartService,$snackbar) {

    $rootScope.extras=true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        $scope.cart=sharedCartService.cart_items;  // Loads users cart

        $scope.get_qty = function() {
          $scope.total_qty=0;
          $scope.total_amount=0;

          for (var i = 0; i < sharedCartService.cart_items.length; i++) {
            $scope.total_qty += sharedCartService.cart_items[i].item_qty;
            $scope.total_amount += (sharedCartService.cart_items[i].item_qty * sharedCartService.cart_items[i].item_price);
          }
          return $scope.total_qty;
        };
      }
      //We dont need the else part because indexCtrl takes care of it
    });

    $scope.removeFromCart=function(c_id){
      sharedCartService.drop(c_id);
      var options = {
        message:"Item Berhasil Dihapus",
        messageColor:"white",
        time:2000
      };
      $snackbar.show(options);
    };

    $scope.inc=function(c_id){
      sharedCartService.increment(c_id);
    };

    $scope.dec=function(c_id){
      sharedCartService.decrement(c_id);
    };

    $scope.checkout=function(){
      $state.go('checkout', {}, {location: "replace"});
    };

     $scope.selectDate=function(c_id, datetimeValue){
      sharedCartService.datepicker(c_id,datetimeValue);
      console.log(datetimeValue)
      var options = {
        message:"Tanggal pemesanan telah di konfirmasi",
        messageColor:"white",
        time:2000
      };
      $snackbar.show(options);
    };



})

.controller('viewCtrl', function($scope,$rootScope,$state,sharedCartService,$snackbar, $firebaseArray,fireBaseData,$ionicPopup) {

    $rootScope.extras=true;

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.messages = $firebaseArray( fireBaseData.refUser().child(user.uid).child("messages") );
        $scope.user_info=user;
        $scope.view=sharedCartService.view_items;  
      }
    });

    $scope.removeView=function(){
      sharedCartService.dropView();
    };

    $scope.$on('$ionicView.leave', function(){
      sharedCartService.dropView();
    });

    $scope.addToCart=function(item){
    sharedCartService.add(item);
    var options = {
      message:"Item Berhasil Ditambahkan",
      messageColor:"white",
      time:2000
    };
    $snackbar.show(options);
  };

    $scope.detail = function(item){
      $ionicPopup.show({
          template: '<p><strong>'+item.title+'</strong></p>' +
                    '<p>'+item.date+'</p>' +
                    '<p>'+item.content+'</p>',
          title: 'Notifikasi',
          subTitle: 'Detail penyewaan',
          scope: $scope,
          buttons: [
            {
              text: 'Tutup',
              type: 'button-positive',
              onTap: function(e) {
                
              }
            }
          ]
      });

      fireBaseData.refUser().child($scope.user_info.uid).child("messages").child(item.$id).update({    // set
            status: "read",
        });
   }


})

.controller('lastOrdersCtrl', function($scope,$rootScope,fireBaseData,sharedUtils,$firebaseArray,$ionicPopup, $filter) {

    $rootScope.extras = true;
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        $scope.user_info = user;

        $scope.orders = $firebaseArray(fireBaseData.refOrder().orderByChild('user_id').equalTo($scope.user_info.uid));

        $scope.detail = function(item){
              $ionicPopup.show({
                  template: '<p>Plat nomor: '+item.product_name+'</p>' +
                            '<p>Lama rental: '+item.item_qty+' jam</p>' +
                            '<p>Metode pembayaran: '+item.payment_id+'</p> ' +
                            '<p>Pembayaran awal: '+item.downpayment_id+' %</p> ' +
                            '<p>Total harga: '+$filter('currency')((item.product_price * item.item_qty), "IDR ", 0)+'</p>'+
                            '<p>Total bayar: '+$filter('currency')((item.downpayment_id / 100) * (item.product_price * item.item_qty), "IDR ", 0)+'</p>'+
                            '<p>Tanggal rental: '+$filter('date')(item.date, "dd-MM-yyyy, H:mm")+'</p>',
                  title: 'Detail',
                  subTitle: 'Detail penyewaan',
                  scope: $scope,
                  buttons: [
                    { text: 'Tutup' },
                    {
                      text: '<b>Cetak</b>',
                      type: 'button-positive',
                      onTap: function(e) {
                        
                      }
                    }
                  ]
              });
           }

          sharedUtils.hideLoading();         
      }
    });





})

.controller('favouriteCtrl', function($scope,$rootScope) {

    $rootScope.extras=true;
})

.controller('settingsCtrl', function($scope,$rootScope,fireBaseData,$firebaseObject,
                                     $ionicPopup,$state,$window,$firebaseArray,
                                     sharedUtils,$snackbar) {
    //Bugs are most prevailing here
    $rootScope.extras=true;

    //Shows loading bar
    sharedUtils.showLoading();

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        //Accessing an array of objects using firebaseObject, does not give you the $id , so use firebase array to get $id
        $scope.addresses= $firebaseArray(fireBaseData.refUser().child(user.uid).child("address"));

        // firebaseObject is good for accessing single objects for eg:- telephone. Don't use it for array of objects
        $scope.user_extras= $firebaseObject(fireBaseData.refUser().child(user.uid));

        $scope.user_info=user; //Saves data to user_info
        //NOTE: $scope.user_info is not writable ie you can't use it inside ng-model of <input>

        //You have to create a local variable for storing emails
        $scope.data_editable={};
        $scope.data_editable.email=$scope.user_info.email;  // For editing store it in local variable
        $scope.data_editable.password="";

        $scope.$apply();

        sharedUtils.hideLoading();

      }

    });

    $scope.addManipulation = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Edit Alamat";
        var sub_title="Edit Alamat Anda";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Tambah Alamat";
        var sub_title="Tambah Alamat Baru";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text"  disabled placeholder="Nama"  ng-model="user_info.displayName"> <br/> ' +
                  '<input type="text"   placeholder="Alamat" ng-model="data.address"> <br/> ' +
                  '<input type="number" placeholder="Kode pin" ng-model="data.pin"> <br/> ' +
                  '<input type="text" disabled placeholder="Telepon" ng-model="user_extras.telephone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Tutup' },
          {
            text: '<b>Simpan</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (  !$scope.data.address || !$scope.data.pin ) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          if(res!=null){ // res ==null  => close 
            fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
              nickname: $scope.user_info.displayName,
              address: res.address,
              pin: res.pin,
              phone: $scope.user_extras.telephone,
            });

             var options = {
              message:"Update tersimpan",
              messageColor:"white",
              time:2000
            };
            $snackbar.show(options);
          }
        }else{
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            nickname: $scope.user_info.displayName,
            address: res.address,
            pin: res.pin,
            phone: $scope.user_extras.telephone,
          });

          var options = {
              message:"Data tersimpan",
              messageColor:"white",
              time:2000
            };
            $snackbar.show(options);
        }

      });

    };

    // A confirm dialog for deleting address
    $scope.deleteAddress = function(del_id) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Hapus Alamat',
        template: 'Anda yakin ingin menghapus alamat ini?',
        buttons: [
          { text: 'Tidak' , type: 'button-stable' },
          { text: 'Ya', type: 'button-assertive' , onTap: function(){return del_id;} }
        ]
      });

      confirmPopup.then(function(res) {
        if(res) {
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(res).remove();
        }
      });
    };

    $scope.save= function (extras,editable) {
      //1. Edit Telephone doesnt show popup 2. Using extras and editable  // Bugs
      if(extras.telephone!="" && extras.telephone!=null ){
        //Update  Telephone
        fireBaseData.refUser().child($scope.user_info.uid).update({    // set
          telephone: extras.telephone
        });
      }

      //Edit Password
      if(editable.password!="" && editable.password!=null  ){
        //Update Password in UserAuthentication Table
        firebase.auth().currentUser.updatePassword(editable.password).then(function(ok) {}, function(error) {});
        sharedUtils.showAlert("Account","Password berhasil di update");
      }

      //Edit Email
      if(editable.email!="" && editable.email!=null  && editable.email!=$scope.user_info.email){

        //Update Email/Username in UserAuthentication Table
        firebase.auth().currentUser.updateEmail(editable.email).then(function(ok) {
          $window.location.reload(true);
          //sharedUtils.showAlert("Account","Email Updated");
        }, function(error) {
          sharedUtils.showAlert("ERROR",error);
        });
      }

    };

    $scope.cancel=function(){
      // Simple Reload
      $window.location.reload(true);
      console.log("CANCEL");
    }

})

.controller('forgotPasswordCtrl', function($scope,$rootScope) {
    $rootScope.extras=false;
  })

.controller('checkoutCtrl', function($scope,$rootScope,sharedUtils,$state,$firebaseArray,
                                     $ionicHistory,fireBaseData, $ionicPopup,sharedCartService,$firebaseObject) {

    $rootScope.extras=true;

    //Check if user already logged in
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        $scope.addresses= $firebaseArray( fireBaseData.refUser().child(user.uid).child("address") );
        $scope.user_info=user;
        $scope.user_extras= $firebaseObject(fireBaseData.refUser().child(user.uid));
      }
    });

    $scope.payments = [
      {id: 'Transfer bank', name: 'Transfer bank', opt: 'Bank BRI 07118955-257 , A/n Crane Rental Maju Jaya'},
      {id: 'Bayar di tempat', name: 'Bayar di tempat', opt: ''}
    ];

    $scope.downpayment = [
      {id: '60', name: '60'},
      {id: '70', name: '70'},
      {id: '80', name: '80'},
      {id: '90', name: '90'},
    ];

    $scope.pay=function(address,payment, downpayment){

      if(address == null || payment == null || downpayment == null){
        //Check if the checkboxes are selected ?
        sharedUtils.showAlert("Peringatan","Lengkapi proses pembayaran terlebih dahulu")
      }
      else {
        // Loop throw all the cart item
        for (var i = 0; i < sharedCartService.cart_items.length; i++) {

          p_id = sharedCartService.cart_items[i].$id;

          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!
          var yyyy = today.getFullYear();

          if(dd<10) {
              dd = '0'+dd
          } 

          if(mm<10) {
              mm = '0'+mm
          } 

          currentDate = dd + '-' + mm + '-' + yyyy;

          function checkTime(i) {
            if (i < 10) {
              i = "0" + i;
            }
            return i;
          }

          var today = new Date();
          var h = today.getHours();
          var m = today.getMinutes();
          var s = today.getSeconds();
          // add a zero in front of numbers<10
          m = checkTime(m);
          s = checkTime(s);

          currentTime = h+':'+m;
          //Add cart item to order table
          fireBaseData.refOrder().push({

            //Product data is hardcoded for simplicity
            product_name: sharedCartService.cart_items[i].item_name,
            product_price: sharedCartService.cart_items[i].item_price,
            product_image: sharedCartService.cart_items[i].item_image,
            product_id: sharedCartService.cart_items[i].$id,

            //item data
            item_qty: sharedCartService.cart_items[i].item_qty,

            //Order data
            user_id: $scope.user_info.uid,
            user_name:$scope.user_info.displayName,
            address_id: address,
            payment_id: payment,
            downpayment_id: downpayment,
            status: "Di proses",
            date: sharedCartService.cart_items[i].date
          });

        }

        fireBaseData.refList().child(p_id).update({
          available: 'Tidak Tersedia'
        })

        fireBaseData.refUser().child($scope.user_info.uid).child("messages").push({    // set
            title: "Order Baru",
            content: "Terima kasih. Pemesanan anda akan di proses setelah transaksi anda selesai",
            status: "unread",
            date: currentDate
        });

        //Remove users cart
        fireBaseData.refCart().child($scope.user_info.uid).remove();

        sharedUtils.showAlert("Info", "Order Berhasil");

        // Go to past order page
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $state.go('lastOrders', {}, {location: "replace", reload: true});
      }
    }



    $scope.addManipulation = function(edit_val) {  // Takes care of address add and edit ie Address Manipulator


      if(edit_val!=null) {
        $scope.data = edit_val; // For editing address
        var title="Edit Alamat";
        var sub_title="Edit Alamat Anda";
      }
      else {
        $scope.data = {};    // For adding new address
        var title="Tambah Alamat";
        var sub_title="Tambah Alamat Baru";
      }
      // An elaborate, custom popup
      var addressPopup = $ionicPopup.show({
        template: '<input type="text" disabled  placeholder="Nama"  ng-model="user_info.displayName"> <br/> ' +
        '<input type="text"   placeholder="Alamat" ng-model="data.address"> <br/> ' +
        '<input type="number" placeholder="Kode Pin" ng-model="data.pin"> <br/> ' +
        '<input type="text" disabled placeholder="Telepon" ng-model="user_extras.telephone">',
        title: title,
        subTitle: sub_title,
        scope: $scope,
        buttons: [
          { text: 'Tutup' },
          {
            text: '<b>Simpan</b>',
            type: 'button-positive',
            onTap: function(e) {
              if ( !$scope.data.address || !$scope.data.pin ) {
                e.preventDefault(); //don't allow the user to close unless he enters full details
              } else {
                return $scope.data;
              }
            }
          }
        ]
      });

      addressPopup.then(function(res) {

        if(edit_val!=null) {
          //Update  address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").child(edit_val.$id).update({    // set
            nickname:  $scope.user_info.displayName,
            address: res.address,
            pin: res.pin,
            phone: $scope.user_extras.telephone,
          });
        }else{
          //Add new address
          fireBaseData.refUser().child($scope.user_info.uid).child("address").push({    // set
            nickname:  $scope.user_info.displayName,
            address: res.address,
            pin: res.pin,
            phone: $scope.user_extras.telephone,
          });
        }

      });

    };


  })

