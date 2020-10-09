const petFinderKey = "S2t3nrRa8vSmzQDxActpsXAhglEQdF5rvVQWfLBKQlT3ByXXia";
const petFinderSecret = "dyFrO08uwicmha6hFDziKndaMhjgk4Wk1joLrYgd";

const token_url = '<https://api.petfinder.com/v2/oauth2/token>';
const token_body = 'grant_type=client_credentials&client_id={petFinderKey}&client_secret={petFinderSecret}';

const access_token = {
    "access_token": token_body,
    "token_type": "Bearer",
    "expires_in": 3600,
    "access_token": "..."
}
