const configuration = importModule("config");
const utils = importModule("utils");

const URL = `https://cocoapi.bmwgroup.com/`;
const VEHICLE_IMAGE_URL = `${URL}eadrax-ics/v3/presentation/vehicles/${configuration.VIN}/images`;
const VEHICLE_URL = `${URL}eadrax-vcs/v1/vehicles`;

module.exports.fetchVehicleImage = async function () {
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir, `${configuration.VIN}.png`);

  if (fm.fileExists(path)) {
    await fm.downloadFileFromiCloud(path);
    console.log("loading vehicle image from file...");
    return fm.readImage(path);
  } else {
    console.log("fetching vehicle image...");
    const access_token = await getAPIToken();
    let req = new Request(VEHICLE_IMAGE_URL);
    req.headers = {
      Authorization: `Bearer ${access_token}`,
      "x-user-agent": "android(v1.07_20200330);bmw;1.5.2(8932)"}
    let data = await req.loadImage();
    console.log("data: " + data)
    if (data) {
      fm.writeImage(path, data);
      return data;
    } else {
      return undefined;
    }
  }
};

module.exports.fetchVehicleData = async function () {
  console.log('fetching vehicle data...');

  let req = new Request(`${URL}/${configuration.VIN}/status?offset=-60`);
  const access_token = await getAPIToken();
  req.headers = { Authorization: `Bearer ${access_token}` };

  let resp = await req.loadJSON();
  console.log('response car data ...' + JSON.stringify(resp)); 
  return {
    mileage: parseInt(resp.vehicleStatus.mileage),
    fuelPercent: parseInt(resp.vehicleStatus.fuelPercent),
    chargingLevelHv: parseInt(resp.vehicleStatus.chargingLevelHv),
    remainingRangeFuel: resp.vehicleStatus.remainingRangeFuel,
    remainingRangeElectric: resp.vehicleStatus.remainingRangeElectric,
    updated: resp.vehicleStatus.updateTime,
  };
};

async function getAPIToken() {
  console.log("checking keychain for API token...");
  if (!Keychain.contains("bmw_access_token")) {
    console.log("no token found...");
    if (!(await requestAPIToken())) return;
    return getAPIToken();
  }
  console.log("checking if its stil valid...");
  const token = JSON.parse(Keychain.get("bmw_access_token"));

  if (Math.floor(Date.now() / 1000) >= token.expires_at) {
    console.log("existing token expired...");
    if (!(await requestAPIToken())) return;
    return getAPIToken();
  }

  console.log("valid token found!");
  return token.access_token;
}

async function requestAPIToken() {
  console.log("requesting API token...");

  const URL = "https://customer.bmwgroup.com/gcdm/oauth/token";
  const OAuthClientData = {
    grant_type: "password",
    scope: "openid profile email offline_access smacc vehicle_data perseus dlm svds cesim vsapi remote_services fupo authenticate_user",
    username: configuration.USERNAME,
    password: configuration.PASSWORD,
  };
  const data = utils.encodeAsQueryString(OAuthClientData);
  console.log("Query: " + data);

  let req = new Request(`${URL}`);
  req.method = "POST";
  req.headers = {
    Authorization:
      "Basic MzFjMzU3YTAtN2ExZC00NTkwLWFhOTktMzNiOTcyNDRkMDQ4OmMwZTMzOTNkLTcwYTItNGY2Zi05ZDNjLTg1MzBhZjY0ZDU1Mg==",
    Credentials:
      "nQv6CqtxJuXWP74xf3CJwUEP:1zDHx6un4cDjybLENN3kyfumX2kEYigWPcQpdvDRpIBk7rOJ",
  };
  req.body = data;

  let resp = await req.loadJSON();

  if (!resp["access_token"]) return false;
  if (!resp["expires_in"]) return false;
  if (!resp["refresh_token"]) return false;

  const token = {
    access_token: resp.access_token,
    refresh_token: resp.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + parseInt(resp.expires_in),
  };

  Keychain.set("bmw_access_token", JSON.stringify(token));
  return true;
}
