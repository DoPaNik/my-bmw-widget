/* 
    Configuration
    Account Data
*/

module.exports = {
  USERNAME: 'XXX',
  PASSWORD: 'XXX',
  VIN: 'XXX',
  MAX_KILOMETERS: 72000, // km
  };

/*
    Color Configuration
*/
module.exports.colorConfig = function (range) {
  // dark mode
  const darkBackgroud = new Color('#101010');
  const darkText = new Color('#E3E3E3');
  const darkWarn = new Color('#FFC000');
  const darkDanger = new Color('#FC1C03');

  // light mode
  const lightBackgroud = new Color('#F5F5F5');
  const lightText = new Color('#000000');
  const lightWarn = new Color('#FC9003');
  const lightDanger = new Color('#FC1C03');

  // range
  var rangeColor = Color.dynamic(lightText, darkText);
  if (range <= 50) {
    rangeColor = Color.dynamic(lightDanger, darkDanger);
  } else if (range <= 100) {
    rangeColor = Color.dynamic(lightWarn, darkWarn);
  }

  return {
    bgColor: Color.dynamic(lightBackgroud, darkBackgroud),
    textColor: Color.dynamic(lightText, darkText),
    rangeColor: rangeColor,
  };
};
