function fn() {
  var env = karate.env;
  var config = {
    baseUrl: 'http://localhost:3000',
    apiVersion: 'v1'
  };

  if (env === 'dev') {
    config.baseUrl = 'http://localhost:3000';
  } else if (env === 'staging') {
    config.baseUrl = 'https://bankapi-staging.render.com';
  } else if (env === 'prod') {
    config.baseUrl = 'https://bankapi-prod.render.com';
  }

  karate.configure('connectTimeout', 5000);
  karate.configure('readTimeout', 10000);

  karate.configure('headers', {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  return config;
}