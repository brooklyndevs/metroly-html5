define(['accordion'], function (Accordion) {

  describe('The Accordion', function () {

    var recent_group = {
      name: "Recent",
      data: [{name: "B61"}, {name: "B62"}],
    };

    
    it("Should Pass", function() {
      expect(true).toBe(true);
    });


    it('Should return new Accordion', function () {
      var accordion = new Accordion();
      expect(accordion).toEqual(new Accordion());
    });


    describe("Group", function () {

      var accordion = new Accordion(
      ).addGroup({
        name: recent_group.name,
        data: recent_group.data
      });

      it('should return same name', function () {
        expect(accordion.groups[recent_group.name].data.name).toEqual(recent_group.name);
      });

      it('should return same data', function () {
        expect(accordion.groups[recent_group.name].data.data).toEqual(recent_group.data);
      });

      it('should return true (same data)', function () {
        expect(accordion.groups[recent_group.name].isSameData(recent_group.data)).toBe(true);
      });

      it('should return same data object', function () {
        expect(accordion.groups[recent_group.name].getData()).toEqual(recent_group);
      });

      it('should be collapsed', function () {
        expect(accordion.groups[recent_group.name].isCollapsed()).toBe(true);
      });

      describe('Modify Data', function () {

        var new_data = [{name: "B36"}, {name: "B15"}];
        
        it('should change data', function () {
          accordion.groups[recent_group.name].changeData({
            data: new_data
          });
          expect(accordion.groups[recent_group.name].data.data).toEqual(new_data);
        });

      });

    });


    describe('Errors', function () {
      var accordion = new Accordion(
      ).addGroup({
        name: recent_group.name,
        data: recent_group.data
      });

      it('should throw an error on adding same group name', function () {
        expect(function() {
          accordion.addGroup({
            name: recent_group.name,
            data: recent_group.data
          })
        }).toThrow();
      });

      it('should throw an error on adding same name to new search group', function () {
        expect(function() {
          accordion.addSearchGroup({
            name: recent_group.name,
            data: recent_group.data
          })
        }).toThrow();
      });

      it('should not throw an error on adding same group name on different accordion', function () {
        var accordion2 = new Accordion();
        expect(function() {
          accordion2.addGroup({
            name: recent_group.name,
            data: recent_group.data
          })
        }).not.toThrow();
      });

    });


  });

});