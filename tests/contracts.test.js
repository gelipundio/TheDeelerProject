const supertest = require("supertest");
const { API_URL, CONTRACT_TYPES } = require("../src/utils/constants");
const { seed } = require("../scripts/seedDb");

describe("Contracts", () => {
  beforeEach(async () => {
    await seed();
  });

  it("should return a the contract correctly if belongs to client", async () => {
    const contractId = 1;
    const profileId = 1;
    const response = await supertest(API_URL)
      .get(`/contracts/${contractId}`)
      .set("profile_id", profileId)
      .expect(200);
    expect(response.body.id).toBe(contractId);
    expect(response.body.ClientId).toBe(profileId);
    expect(response.body.status).toBe(CONTRACT_TYPES.terminated);
  });

  it("should NOT return a contract that not belongs to client", async () => {
    const contractId = 1;
    const profileId = 2;
    await supertest(API_URL)
      .get(`/contracts/${contractId}`)
      .set("profile_id", profileId)
      .expect(404);
  });

  it("should return all contracts of user", async () => {
    const profileId = 1;
    const profileId2 = 2;
    const response = await supertest(API_URL)
      .get("/contracts")
      .set("profile_id", profileId)
      .expect(200);
    expect(response.body.length).toBe(1);

    const response2 = await supertest(API_URL)
      .get("/contracts")
      .set("profile_id", profileId2)
      .expect(200);
    expect(response2.body.length).toBe(2);
  });
});
