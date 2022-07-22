const { DEPOSIT_ERROR } = require("../utils/errors");
const JobsController = require("./jobs");

async function increaseBalance(
  { JobModel, ContractModel, ProfileModel },
  { userId, deposit }
) {
  // get userInfo
  const user = await ProfileModel.findOne({ where: { id: userId } });

  // get all jobs to pay
  const jobs = await JobsController.getUnpaid(
    { JobModel, ContractModel },
    { profileId: userId, profileType: user.type }
  );

  // get jobs total
  const totalDebt = jobs.reduce((a, b) => (a += b.price), 0);

  // check 25%
  const maxDeposit = totalDebt / 4;
  if (maxDeposit < deposit) throw DEPOSIT_ERROR;

  // update balance
  await ProfileModel.update(
    { balance: user.balance + deposit },
    { where: { id: userId } }
  );
}

module.exports = {
  increaseBalance,
};
