define(['oba', 'appState'], function (Oba, appState) {

  describe('The OneBusAway Wrapper', function () {

    beforeEach(function () {
      appState.init();
    });

    it('Gets bus stops', function () {
      var stops;

      var cbs = {
        handleStops: function (data) {
          console.log('got this data', data);
          stops = data;
        }
      };

      spyOn(cbs, 'handleStops');

      Oba.getBusStops('b63', cbs.handleStops);

      waitsFor(function() {
          return cbs.handleStops.callCount > 0;
      });

      runs(function() {
          expect(cbs.handleStops).toHaveBeenCalled();
      });

    });

  });

});