// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: taxi;

const api = importModule('my-bmw/api');
const utils = importModule('my-bmw/utils');
const configuration = importModule('my-bmw/config');

if (config.runsInWidget) {
  const size = config.widgetFamily;
  const widget = await createWidget(size);

  Script.setWidget(widget);
  Script.complete();
} else {
  // Choose a size for debugging
  //const size = 'small';
  const size = 'medium';
  //const size = 'large'
  const widget = await createWidget(size);
  if (size == 'small') {
    widget.presentSmall();
  } else if (size == 'medium') {
    widget.presentMedium();
  } else {
    widget.presentLarge();
  }
  Script.complete();
}

async function createWidget(size) {
  const data = await api.fetchVehicleData();
  const colors = configuration.colorConfig(data.remainingRangeFuel + data.remainingRangeElectric);

  const widget = new ListWidget();
  widget.backgroundColor = colors.bgColor;
  const car = await api.fetchVehicleImage();

  if (size == 'small') {
    widget.setPadding(0, 0, 0, 0);
    const contentStack = widget.addStack();
    contentStack.layoutHorizontally();
    if(car)
      contentStack.addImage(car);
  } else if (size == 'medium') {
    widget.setPadding(0, 15, 10, 15);
    const mileage = data.mileage;

    const contentStack = widget.addStack();
    contentStack.layoutHorizontally();
    if(car)
      contentStack.addImage(car);

    contentStack.addSpacer();

    const entireRangeStack = contentStack.addStack();
    entireRangeStack.layoutVertically();

    entireRangeStack.addSpacer();

    const entireRangeText = entireRangeStack.addText(data.remainingRangeFuel + data.remainingRangeElectric + " km");
    entireRangeText.font = Font.boldMonospacedSystemFont(35);
    entireRangeText.minimumScaleFactor = 0.5;

    entireRangeStack.addSpacer();

    const rangeStack = widget.addStack();
    rangeStack.layoutHorizontally();

    const rangeimg = rangeStack.addImage(SFSymbol.named('fuelpump').image);
    rangeimg.imageSize = new Size(13, 13);
    rangeimg.tintColor = colors.rangeColor;

    rangeStack.addSpacer(10);

    const rangeText = rangeStack.addText(`${data.remainingRangeFuel} km`);
    rangeText.font = Font.regularMonospacedSystemFont(12);
    rangeText.textColor = colors.rangeColor;

    widget.addSpacer();

    widget.addImage(utils.createProgressbar(100, data.fuelPercent, 25));

    widget.addSpacer();

    const rangeElectricStack = widget.addStack();
    rangeElectricStack.layoutHorizontally();

    const rangeElecticImg = rangeElectricStack.addImage(SFSymbol.named('bolt.fill.batteryblock').image);
    rangeElecticImg.imageSize = new Size(13, 13);
    rangeElecticImg.tintColor = colors.rangeColor;

    rangeElectricStack.addSpacer(10);

    const rangeElectrircText = rangeElectricStack.addText(`${data.remainingRangeElectric} km`);
    rangeElectrircText.font = Font.regularMonospacedSystemFont(12);
    rangeElectrircText.textColor = colors.rangeColor;

    widget.addSpacer();

    widget.addImage(utils.createProgressbar(100, data.chargingLevelHv, 25));

    widget.addSpacer();

    const mileageStack = widget.addStack();
    mileageStack.layoutHorizontally();

    const milageIcon = mileageStack.addImage(SFSymbol.named('speedometer').image);
    milageIcon.imageSize = new Size(14, 14);
    milageIcon.tintColor = colors.textColor;

    mileageStack.addSpacer(10);

    const mileageText = mileageStack.addText(
      `${mileage} / ${configuration.MAX_KILOMETERS} km`
    );
    mileageText.font = Font.boldMonospacedSystemFont(15);

    mileageStack.addSpacer();

    const updateStack = widget.addStack();
    updateStack.addSpacer();

    const updateImg = SFSymbol.named('arrow.clockwise').image;
    const updateIcon = updateStack.addImage(updateImg);
    updateIcon.imageSize = new Size(9, 9);
    updateIcon.tintColor = colors.textColor;

    updateStack.addSpacer(5);

    const updated = new Date(data.updated);
    const updateText = updateStack.addText(`${updated.toLocaleString()}`);
    updateText.font = Font.systemFont(9);
  }
  return widget;
}
