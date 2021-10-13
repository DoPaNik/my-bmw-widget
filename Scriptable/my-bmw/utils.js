const configuration = importModule('config');

module.exports.encodeAsQueryString = function (json) {
  var result = '';
  for (var key in json) {
    let val = json[key];
    val = encodeURIComponent(val);
    result += result ? '&' : '';
    result += `${key}=${val}`;
  }
  return result;
};

module.exports.createProgressbar = function (total, used, withinLimit) {
  const width = 200;
  const height = 5;
  const fillColor = withinLimit ? new Color('#26CC23') : new Color('#CC2323');

  const context = new DrawContext();
  context.size = new Size(width, height);
  context.opaque = false;
  context.respectScreenScale = true;
  context.setFillColor(new Color('#9C9C9C'));

  const path = new Path();
  path.addRoundedRect(new Rect(0, 0, width, height), 3, 2);
  context.addPath(path);
  context.fillPath();
  context.setFillColor(fillColor);

  const path1 = new Path();
  path1.addRoundedRect(new Rect(0, 0, (width * used) / total, height), 3, 2);
  context.addPath(path1);
  context.fillPath();

  return context.getImage();
};
