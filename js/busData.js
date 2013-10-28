define(['text!data/busLines.json'], function (busLinesData) {

  var busLines = JSON.parse(busLinesData);
  console.log('>>>> busLines', busLines);
  return busLines;

});