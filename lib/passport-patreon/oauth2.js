var util = require("util");
var OAuth2Strategy = require("passport-oauth2");
var InternalOAuthError = require("passport-oauth2").InternalOAuthError;
var request = require("request");

function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL =
    options.authorizationURL || "https://www.patreon.com/oauth2/authorize";
  options.tokenURL = options.tokenURL || "https://api.patreon.com/oauth2/token";

  OAuth2Strategy.call(this, options, verify);
  this.name = "patreon";

  this._oauth2.setAuthMethod("OAuth");
  this._oauth2.useAuthorizationHeaderforGET(true);
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
  request(
    {
      url: "https://www.patreon.com/api/oauth2/v2/identity?fields%5Buser%5D=email,first_name,full_name,image_url,last_name,thumb_url,url,vanity,is_email_verified",
      headers: {
        Authorization: "Bearer " + accessToken,
        "User-Agent": "passport-patreon",
      },
    },
    function (err, res, body) {
      if (err) {
        return done(
          new InternalOAuthError("failed to fetch user profile", err)
        );
      }
      try {
        var json = JSON.parse(body);

        console.log('JSON', json);
        json = json.data;
        var profile = { provider: "patreon" };
        profile.id = json.id;
        profile.name = json.attributes.full_name;
        profile.avatar = json.attributes.image_url;
        profile.email = json.attributes.email;

        profile._raw = body;
        profile._json = json;

        done(null, profile);
      } catch (e) {
        done(e);
      }
    }
  );
};

module.exports = Strategy;
