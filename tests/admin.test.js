const supertest = require("supertest");
const { API_URL } = require("../src/utils/constants");
const { seed } = require("../scripts/seedDb");

describe("Admin", () => {
  beforeEach(async () => {
    await seed();
  });

  it("Get best profession (filter 1)", async () => {
    const startDate = "2020-01-01";
    const endDate = "2022-12-01";
    const response = await supertest(API_URL)
      .get(`/admin/best-profession?start=${startDate}&end=${endDate}`)
      .set("profile_id", 1)
      .expect(200);
    expect(response.body.bestProfession).toBe("Programmer");
  });

  it("Get best profession (filter 2)", async () => {
    const startDate = "2020-01-01";
    const endDate = "2020-07-01";
    const response = await supertest(API_URL)
      .get(`/admin/best-profession?start=${startDate}&end=${endDate}`)
      .set("profile_id", 1)
      .expect(200);
    expect(response.body.bestProfession).toBe("NO PROFESSION");
  });

  it("Get best profession (filter 3)", async () => {
    const startDate = "2020-01-01";
    const endDate = "2020-08-14";
    const response = await supertest(API_URL)
      .get(`/admin/best-profession?start=${startDate}&end=${endDate}`)
      .set("profile_id", 1)
      .expect(200);
    expect(response.body.bestProfession).toBe("Musician");
  });

  it("Get best clients (with no limit)", async () => {
    const startDate = "2010-01-01";
    const endDate = "2020-08-16";
    const response = await supertest(API_URL)
      .get(`/admin/best-clients?start=${startDate}&end=${endDate}`)
      .set("profile_id", 1)
      .expect(200);
    expect(response.body.length).toBe(2);
  });

  it("Get best clients (with limit 3)", async () => {
    const startDate = "2010-01-01";
    const endDate = "2020-08-16";
    const limit = 3;
    const response = await supertest(API_URL)
      // .get(`/admin/best-clients?start=${startDate}&end=${endDate}&limit=3`)
      .get(
        `/admin/best-clients?start=${startDate}&end=${endDate}&limit=${limit}`
      )
      .set("profile_id", 1)
      .expect(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].id).toBe(4);
    expect(response.body[0].paid).toBe(2020);
    expect(response.body[1].id).toBe(2);
    expect(response.body[1].paid).toBe(242);
    expect(response.body[2].id).toBe(1);
    expect(response.body[2].paid).toBe(42);
  });

  it("Get best clients (with limit 3, alternative date)", async () => {
    const startDate = "2010-01-01";
    const endDate = "2020-08-20";
    const limit = 3;
    const response = await supertest(API_URL)
      // .get(`/admin/best-clients?start=${startDate}&end=${endDate}&limit=3`)
      .get(
        `/admin/best-clients?start=${startDate}&end=${endDate}&limit=${limit}`
      )
      .set("profile_id", 1)
      .expect(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].id).toBe(4);
    expect(response.body[0].paid).toBe(2020);
    expect(response.body[1].id).toBe(1);
    expect(response.body[1].paid).toBe(442);
    expect(response.body[2].id).toBe(2);
    expect(response.body[2].paid).toBe(442);
  });
});
