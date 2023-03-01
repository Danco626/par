const router = require("express").Router();
const axios = require("axios");
const { requiresAuth } = require("express-openid-connect");
const qs = require("qs");

router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Auth0 Webapp sample Nodejs",
    isAuthenticated: req.oidc.isAuthenticated(),
  });
});

router.get("/profile", requiresAuth(), function (req, res, next) {
  res.render("profile", {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: "Profile page",
  });
});

router.get("/login", async (req, res) => {
  const state = "MyStateIsHere";
  const stateObject = { returnTo: "/profile", customState: state }
  
  //par
  const result = await postPar(stateObject);
  res.oidc.login({
    returnTo: "/profile",
    authorizationParams: {
      redirect_uri: "http://localhost:3000/callback",
      request_uri: result.request_uri,
      state: state
    },
  });
});

const postPar = async (state) => {
  try{
  const headers = {
    "content-type":  "application/x-www-form-urlencoded"
  };

  const options = qs.stringify({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: "http://localhost:3000/callback",
    response_type: "code",
    "ext-context": "password reset",
    scope: "openid profile email",
    nonce:"defaultNonce",
    state:Buffer.from(JSON.stringify(state)).toString('base64url')
  });



  const parResult = await axios.post("https://danco.auth0.com/oauth/par", options, headers);
  return parResult.data;
}catch(e) {
  console.log(e);
}
}

module.exports = router;
