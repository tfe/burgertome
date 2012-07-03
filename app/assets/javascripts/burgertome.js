BurgerToMe = {

  EARTH_RADIUS: 3963.19059,

  initialize: function () {
    // initialize item list and address autocomplete
    BurgerToMe.OrderList.initialize($("ul.order.list"));
    this.initializeAddress($(".where"));

    // watch all text inputs for the return key and disable it
    $('#main').delegate('input[type="text"]', 'keypress', function(e) {
      if (e.which === 13) {
        // return/enter key pressed, ignore it
        e.preventDefault();

        var field = $(document).find(':focus').parent().next();
        if (field) {
          field.find('input').focus();
        }
      }
    });
  },

  initializeAddress: function (el) {
    var center = new google.maps.LatLng(37.77493, -122.419416);
    var radius = 20;
    var zoom   = 12;
    var size   = "700x200";
  
    var map_image_base_url = "//maps.googleapis.com/maps/api/staticmap?size="+size+"&maptype=roadmap&sensor=false";
    if (this.GMAPS_STATIC_API_KEY) {
      map_image_base_url += "&key="+this.GMAPS_STATIC_API_KEY
    }

    var field_name_map = _({ // this object maps our form fields to google maps place object fields
      'address_address': ['street_number', 'route'],
      'address_city'   : ['locality'],
      'address_state'  : ['administrative_area_level_1'],
      'address_zip'    : ['postal_code']
    });


    var bounds = new google.maps.LatLngBounds(
      google.maps.geometry.spherical.computeOffset(center, radius, 45+180,  this.EARTH_RADIUS), // calculate NE corner
      google.maps.geometry.spherical.computeOffset(center, radius, 45,      this.EARTH_RADIUS)  // calculate SW corner
    );
  
    var input = el.find('#address')[0];
    var map_image_initial_params = "&center=" + center.toUrlValue() + "&zoom=" + zoom;
    var map_image = $('<img src="' + map_image_base_url + map_image_initial_params + '" class="location_map">');
  
    // show and hide fields, add map image
    el.append(map_image);

    var autocomplete = new google.maps.places.Autocomplete(input, { bounds: bounds, types: ['geocode'] });

    google.maps.event.addListener(autocomplete, 'place_changed', function () {
      var place  = autocomplete.getPlace();
      var center = place.geometry.location.toUrlValue();
      var map_image_location_params  = "&markers=size:mid%7Ccolor:red%7C";
          map_image_location_params += center;
          map_image_location_params += "&center=" + center;
          map_image_location_params += "&zoom=" + 15;

      // show map image
      map_image.attr('src', map_image_base_url + map_image_location_params);

      // update legacy address fields
      field_name_map.each(function (gmaps_name, form_name) {

        // extract value from gmaps place object (multiple fields are concatenated using inject())
        var value = _(gmaps_name).inject(function (s, name) {
          var target_component = _(place.address_components).filter(function (component) {
            return _.contains(component.types, name);
          });
          if (target_component.length > 0) {
            return $.trim([s, target_component[0].short_name].join(' '));
          }
        }, '');

        // insert into our form field
        var selector = ['#', form_name].join('');
        var input = el.find(selector);

        input.val(value);
      });

      // update lat/lng and full address fields
      var lat = place.geometry.location.lat(),
          lng = place.geometry.location.lng(),
          address = place.formatted_address;
      el.find('#address_lat').val(lat);
      el.find('#address_lng').val(lng);
      el.find('#address_full').val(address)
    });
  },
  
  
  refreshTask: function () {
    $.ajax({
      url: BurgerToMe.taskUrl,
      data: {'access_token': BurgerToMe.token},
      dataType: 'jsonp',
      success: function (data, status) {

        if (data.state == 'assigned') {

          var production_avatar = data.runner.links.avatar_url.replace("http://s3.amazonaws.com/assets-staging.taskrabbit.com", "http://uploads.taskrabbit.com")

          $('#avatar').attr('src', production_avatar);
          $('#rabbit .name').html(data.runner.display_name);
          $('#mobile_phone .name').html(data.runner.short_name);
          $('#mobile_phone .number').html(data.runner.mobile_phone);
          $('#task_link').attr('href', data.links.authenticated);

          $('.opened').hide();
          $('.assigned').show();

        } else {
          setTimeout(BurgerToMe.refreshTask, 5000);
        }
      
      },
      error: function (xhr, status, error) { console.log(xhr); console.log(status); console.log(error); }
    });
  },
  
  
  OrderList: {
    initialize: function (el) {
      var that = this;
      this.el = el;
      var list = el.val();
      if(list.length > 0){
        list = list.split("\n");
        $(list).each(function(n, v){
          that.newLineItem(v);
        });
        this.newLineItem();
      }else{
        this.newLineItem();
      }
    },
    
    newLineItem: function (value) {
      var that = this;
      var num = this.el.children().length+1;
      var last = this.el.find('li:nth-child('+(num-1)+')');
      var newItem = '';
      var funkyMenuItems = [
        'Double Double',
        'Grilled Onions',
        'Double Meat',
        'Cut-In-Half',
        'Animal Style',
        'Flying Dutchman',
        'Grilled Cheese',
        'Protein Style',
        'Veggie Burger',
        'Animal Style Fries',
        'Cheese Fries',
        'Fries, Well-Done',
        'Neapolitan Shake',
        'Choco-Vanilla Swirl Shake',
        'Root-Beer Float'
      ];

      var randomItem = _.shuffle(funkyMenuItems)[0];

      if(last[0]){var prev = last.find('input').val();}
      if(num == 1 || prev && prev.replace(/ /g,'').length > 0){
        if(value == undefined){value =""};
        newItem = $('<li class="listItem" id="orderItem'+num+'"><label class="itemLabel">'+num+'</label><input type="text" class="itemInput" name="input'+num+'" value="'+value+'" placeholder="'+randomItem+'" autocomplete="off" onkeyup="BurgerToMe.OrderList.saveLineItem(this)" /><div class="kill"></div></li>');
        this.el.append(newItem);
      }
      
      var input = newItem.find(".itemInput")
      input.focusout(function(){
        that.deleteOnFocusOut($(this).parent());
      });

      input.hover(function(){
        $(this).css({"background-color":"#FBFCFD"});
        var parent = $(this).parent();
        var value = parent.find('input').val();
        var kill  = parent.find('div:last');

        if(value.length >0){
          kill.show();
        }
        $(kill).hover(function(){
          $(this).show();
        })
        $(kill).mouseout(function(){
          $(this).hide();
        })
        $(kill).click(function(){
          that.deleteLineItem(parent);
        })
      });
      input.mouseout(function(){
        $(this).css({"background-color":"#FFFFFF"});
        $(this).parent().find('div:last').hide();
      });

     //setPlaceholders(newItem);
    },

    deleteLineItem: function (obj) {
      obj.remove();
      this.combineOrderList();
    },

    deleteOnFocusOut: function (obj) {
      var obj = $(obj),
          val = obj.find('input').val()
      if(obj.is('li:first-child') && !obj.is('li:last-child') && val.replace(/ /g,'').length == 0){
        obj.remove();
      }else if(!obj.is('li:first-child') && !obj.is('li:last-child') && val.replace(/ /g,'').length == 0){
        obj.remove();
      }
      this.combineOrderList();
    },

    saveLineItem: function (obj) {
      if($(obj).parent().is('li:last-child') && $(obj).val().replace(/ /g,'').length > 0){
        var num = $(obj).parent().parent().index()+1;
        // orderList[num] = $(obj).val();
        this.newLineItem();
      // }else if(!$(obj).parent().is('li:last-child') && $(obj).val().replace(/ /g,'').length == 0){
      //   deleteLineItem($(obj).parent())
      }
      this.combineOrderList();
    },

    combineOrderList: function () {
      var list = [];
      this.el.find('li').each(function(n,v){
        var label = $(v).find('label');
        var input = $(v).find('input');
        var value = input.val();
        // Renumber Line Items
        $(v).attr('id', 'orderItem'+(n+1));
        label.text(n+1);
        // Push no value to array
        if (value.length > 0){
          list.push(value);
        }
      });
      $('#order_description').val(list.join("\n"));
    }
  }
};

$(document).ready(function() {
  var body = $('body');
  if (body.hasClass('orders') && body.hasClass('new')) {
    BurgerToMe.initialize();
  }
  
  if (body.hasClass('show')) {
    BurgerToMe.refreshTask();
  }
});
