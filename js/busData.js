define(['text!data/busLines.json'], function (busLinesData) {

  var busLines = JSON.parse(busLinesData);
  return busLines;

});