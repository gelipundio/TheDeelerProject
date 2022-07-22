const supertest = require("supertest");
const { API_URL } = require("../src/utils/constants");
const { seed } = require("../scripts/seedDb");

describe("Balance", () => {
  beforeEach(async () => {
    await seed();
  });

  it("should be able to update balance", async () => {
    const profileId = 1;
    const currentBalance = 1150;
    const deposit = 50;
    const newBalance = currentBalance + deposit;

    const profileResponse = await supertest(API_URL)
      .get("/profile")
      .set("profile_id", profileId)
      .expect(200);
    expect(profileResponse.body.balance).toBe(currentBalance); //from seed

    await supertest(API_URL)
      .post(`/balances/deposit/${profileId}`)
      .set("profile_id", profileId)
      .send({ deposit })
      .expect(200);

    const verifyResponse = await supertest(API_URL)
      .get("/profile")
      .set("profile_id", profileId)
      .expect(200);
    expect(verifyResponse.body.balance).toBe(newBalance);
  });

  it("should fail if deposit is bigger than 25% of debts", async () => {
    const profileId = 1;
    const deposit = 500;

    await supertest(API_URL)
      .post(`/balances/deposit/${profileId}`)
      .set("profile_id", profileId)
      .send({ deposit })
      .expect(400);
  });
});
