const { expect } = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../src/server");

// Assertion style
chai.should();

chai.use(chaiHttp);

describe("Testing API endpoints", () => {
  /**
   * Testing /
   */
  describe("/", () => {
    it("Homepage", (done) => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          res.should.have.status(200);
        });
      done();
    });
  });

  /**
   * Testing /new
   */
  describe("/new + /:slug", () => {
    it("Creating new short link and access it", (done) => {
      chai
        .request(server)
        .post("/new")
        .send({ url: "wikipedia.fr" })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          const slug = res.text.slice(10, 16);
          chai
            .request(server)
            .get(`/${slug}`)
            .end((err, res) => {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res.redirects).to.have.length(1);
            });
          done();
        });
    });
  });

  /**
   * Testing /clean and /list without auth
   */
  describe("/clean and /list without authentification", () => {
    it("Trying to list the database without password", (done) => {
      chai
        .request(server)
        .post("/list")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
        });
      done();
    });

    it("Trying to clean the database without password", (done) => {
      chai
        .request(server)
        .del("/clean")
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(401);
        });
      done();
    });
  });
});
