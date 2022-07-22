const supertest = require("supertest");
const { API_URL } = require("../src/utils/constants");
const { seed } = require("../scripts/seedDb");

describe("Jobs", () => {
  beforeEach(async () => {
    await seed();
  });

  it("should return all unpaid jobs", async () => {
    const profileId1 = 1;
    const response1 = await supertest(API_URL)
      .get("/jobs/unpaid")
      .set("profile_id", profileId1)
      .expect(200);
    expect(response1.body.length).toBe(1);

    const profileId2 = 2;
    const response2 = await supertest(API_URL)
      .get("/jobs/unpaid")
      .set("profile_id", profileId2)
      .expect(200);
    expect(response2.body.length).toBe(2);

    const profileId3 = 3;
    const response3 = await supertest(API_URL)
      .get("/jobs/unpaid")
      .set("profile_id", profileId3)
      .expect(200);
    expect(response3.body.length).toBe(0);
  });

  it("should be able to pay a job", async () => {
    const profileId = 1;
    // there is 1 unpaid job
    const response = await supertest(API_URL)
      .get("/jobs/unpaid")
      .set("profile_id", profileId)
      .expect(200);
    expect(response.body.length).toBe(1);

    // pay the job
    await supertest(API_URL)
      .post(`/jobs/${response.body[0].id}/pay`)
      .set("profile_id", profileId)
      .expect(200);

    // verify there is no unpaid jobs
    const verifyResponse = await supertest(API_URL)
      .get("/jobs/unpaid")
      .set("profile_id", profileId)
      .expect(200);
    expect(verifyResponse.body.length).toBe(0);
  });
});
