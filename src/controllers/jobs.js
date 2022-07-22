const ContractsController = require("./contracts");
const { Op } = require("sequelize");
const { CONTRACT_TYPES } = require("../utils/constants");
const {
  JOB_NOT_PAYABLE,
  INSUFFICIENT_BALANCE,
  JOB_NOT_FOUND,
  CONTRACT_NOT_FOUND,
} = require("../utils/errors");

async function getUnpaid(
  { JobModel, ContractModel },
  { profileId, profileType }
) {
  const contracts = await ContractsController.getAll(
    { ContractModel },
    { profileId, profileType, status: CONTRACT_TYPES.in_progress }
  );
  const contractIds = contracts.map((c) => c.id);
  return JobModel.findAll({
    where: {
      paid: {
        [Op.not]: true,
      },
      ContractId: {
        [Op.in]: contractIds,
      },
    },
  });
}

async function getOne({ JobModel, ContractModel }, { jobId }) {
  const job = await JobModel.findOne({ where: { id: jobId } });
  if (!job) throw JOB_NOT_FOUND;
  job.contract = await ContractModel.findOne({ where: { id: job.ContractId } });
  if (!job.contract) throw CONTRACT_NOT_FOUND;
  return job;
}

async function payJob(
  { JobModel, ContractModel, ProfileModel },
  { profile, jobId }
) {
  const job = await getOne({ JobModel, ContractModel }, { jobId });

  // check if this job is his job and can
  if (job.contract.ClientId !== profile.id) throw JOB_NOT_PAYABLE;
  if (job.price > profile.balance) throw INSUFFICIENT_BALANCE;
  if (job.paid) throw JOB_NOT_PAYABLE;

  // update user balance
  await ProfileModel.update(
    {
      balance: profile.balance - job.price,
    },
    {
      where: { id: profile.id },
    }
  );

  // update job info
  await JobModel.update(
    {
      paid: true,
      paymentDate: new Date(),
      updatedAt: new Date(),
    },
    {
      where: { id: job.id },
    }
  );
}

module.exports = {
  getUnpaid,
  payJob,
  getOne,
};
