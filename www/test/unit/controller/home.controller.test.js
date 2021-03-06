describe('HomeController', function() {
  var scope, placeFactory, state, place, addressFactory, q, deferred, geolocationFactory, ionicLoading;

  beforeEach(function() {
    module('vamosJuntas');

    inject(function ($rootScope, $controller, $injector, $q, $httpBackend, $ionicLoading) {
        scope = $rootScope.$new();
        httpBackend = $injector.get('$httpBackend');
        placeFactory = $injector.get('placeFactory');
        addressFactory = $injector.get('addressFactory');
        ionicLoading = $injector.get('$ionicLoading');
        geolocationFactory = $injector.get('geolocationFactory');
        q = $q;
        deferred = $q.defer();
        httpBackend.whenGET(/templates.*/).respond('');

        createController = function() {
          $controller('HomeController', {
            '$scope': scope,
            'placeFactory': placeFactory,
            'addressFactory': addressFactory,
            'geolocationFactory': geolocationFactory,
            '$ionicLoading': ionicLoading
          });
        };
    });

    place = {
      "title": "Chafariz da Redenção",
      "occurrences": [{
        "address": "Avenida Ipiranga",
        "risk": "Local Deserto",
        "date": "10/10/2015",
        "period": "Manhã",
        "numberOfOccurrences": 3
      }, {
        "address": "Avenida Ipiranga",
        "risk": "Mal Iluminado",
        "date": "10/10/2015",
        "period": "Manhã",
        "numberOfOccurrences": 4
      }, {
        "address": "Avenida Ipiranga",
        "risk": "roubo",
        "date": "10/10/2015",
        "period": "Manhã",
        "numberOfOccurrences": 10
      }]
    };

    spyOn(placeFactory, 'fetchPlaces').and.callFake(function() {
      return {
        then: function(callback) {
          return callback(place);
        }
      };
    });

    spyOn(addressFactory, 'getAddressByCoord').and.returnValue(q.when('Av. Ipiranga, 6681'));

    spyOn(geolocationFactory, 'getCurrentPosition').and.returnValue(deferred.promise);

  });

  it('should get info for a specific place', function() {
    spyOn(placeFactory, 'addPlace');

    createController();
    scope.getSpecificPlace(place);

    expect(placeFactory.addPlace).toHaveBeenCalledWith(place);
  });

  it('should fill the search with the selected address', function() {
    var place = {
      description: 'Av. Ipiranga, 123 - Porto Alegre'
    };
  });

  it('should get a total of occurrences from a specific place', function() {
    createController();
    expect(scope.getTotalOfOccurrences(place)).toBe(17);
  });

  describe('get successfully current position', function (){
    beforeEach(function () {

       deferred.resolve({
        coords: {
          latitude: -30.057977,
          longitude: -51.1755227
        }
      });
    });

    it('should show the current position', function () {
      var posOptions = {timeout: 5000, enableHighAccuracy: false};

      createController();
      scope.$apply();
      expect(geolocationFactory.getCurrentPosition).toHaveBeenCalledWith(posOptions);
    });

    it('gets the risk places', function() {
      createController();
      scope.$apply();
      expect(placeFactory.fetchPlaces).toHaveBeenCalledWith(-30.057977, -51.1755227);
    });

    it('gets the address by coords', function() {
      createController();
      scope.$apply();
      expect(addressFactory.getAddressByCoord).toHaveBeenCalledWith(-30.057977, -51.1755227);
      expect(scope.search.text).toBe('Av. Ipiranga, 6681');
    });
  });


  describe('fails to get current position', function () {
    beforeEach(function () {
      deferred.reject();
    });

    it('should not show the current position', function () {
      createController();
      scope.$apply();
      expect(scope.errorMessage).toBe(true);
    });

    it('should not get the risk places and address', function() {
      createController();
      scope.$apply();
      expect(placeFactory.fetchPlaces).not.toHaveBeenCalled();
      expect(addressFactory.getAddressByCoord).not.toHaveBeenCalled();
    });
  });
});
