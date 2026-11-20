/**
 * Authenticated supertest
 * A drop-in for `require("supertest")`: every request sent through `request(app)` carries the valid
 * test token from globalSetup in its Authorization header, so the /api/v2/ tests pass the sign-in check
 * (ADR-014). Use plain supertest to send a request without it.
 */

const supertest = require("supertest");

const METHODS = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);

const request = (app) =>
  new Proxy(supertest(app), {
    get(agent, name) {
      if (!METHODS.has(name)) {
        return agent[name];
      }
      return (...args) => agent[name](...args).set("Authorization", `Bearer ${process.env.TEST_AUTH_TOKEN}`);
    },
  });

module.exports = request;
