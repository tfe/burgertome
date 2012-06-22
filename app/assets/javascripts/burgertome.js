BurgerToMe = {

  EARTH_RADIUS: 3963.19059,

  initialize: function () {
    // initialize address autocomplete
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
    var size   = "718x200";
  
    var map_image_base_url = "//maps.googleapis.com/maps/api/staticmap?size="+size+"&maptype=roadmap&sensor=false&key="+this.GMAPS_STATIC_API_KEY;

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
  }
};

$(document).ready(function() {
  var body = $('body');
  if (body.hasClass('orders') && body.hasClass('new')) {
    BurgerToMe.initialize();
  }
});
