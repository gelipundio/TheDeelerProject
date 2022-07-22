const { Op } = require("sequelize");

async function getMostPayedJobs({ JobModel }, { start, end }) {
  /**
   * for this function i tried to do it with db grouping,
   * but it was not grouping properly, sequelize(maybe sqlite) was basically ignoring my group statement
   */
  const paidJobs = await JobModel.findAll({
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end],
      },
    },
  });
  const contracts = {};
  let mostValuableContract = { ContractId: 0, money: 0 };

  paidJobs.forEach((job) => {
    if (!contracts[job.ContractId]) {
      contracts[job.ContractId] = {
        money: job.price,
        ContractId: job.ContractId,
      };
    } else {
      contracts[job.ContractId].money += job.price;
    }
    if (contracts[job.ContractId].money > mostValuableContract.money) {
      mostValuableContract = {
        ContractId: job.ContractId,
        money: contracts[job.ContractId],
      };
    }
  });

  return {
    contracts,
    mostValuableContract,
  };
}

async function getBestProfession(
  { JobModel, ContractModel, ProfileModel },
  { start, end }
) {
  // get the summary of paid jobs
  const { mostValuableContract } = await getMostPayedJobs(
    {
      JobModel,
      ContractModel,
    },
    { start, end }
  );

  // get contract data
  const contract = await ContractModel.findOne({
    where: { id: mostValuableContract.ContractId },
  });
  if (!contract) return "NO PROFESSION";

  // get profile data
  const profile = await ProfileModel.findOne({
    where: { id: contract.ContractorId },
  });
  return profile.profession;
}

async function getBestClients(
  { JobModel, ContractModel, ProfileModel },
  { start, end, limit }
) {
  const clientGroup = {};

  // get the summary of paid jobs
  const { contracts } = await getMostPayedJobs(
    { JobModel, ContractModel },
    { start, end }
  );

  // get contract data in order to get clientId
  const contractIds = Object.keys(contracts);
  for (let x = 0; x <= contractIds.length - 1; x++) {
    const contractInfo = await ContractModel.findOne({
      where: { id: contracts[contractIds[x]].ContractId },
    });
    if (!clientGroup[contractInfo.ClientId]) {
      clientGroup[contractInfo.ClientId] = {
        clientId: contractInfo.ClientId,
        paid: contracts[contractIds[x]].money,
      };
    } else {
      clientGroup[contractInfo.ClientId].paid += contracts[x].money;
    }
  }

  // order by paid mount, and apply limit
  const orderedClients = Object.values(clientGroup)
    .sort((c1, c2) => c2.paid - c1.paid)
    .slice(0, limit);

  // populate with profile info
  return Promise.all(
    orderedClients.map(async ({ clientId, paid }) => {
      const client = await ProfileModel.findOne({
        where: { id: clientId },
      });
      return {
        id: clientId,
        fullName: `${client.firstName} ${client.lastName}`,
        paid,
      };
    })
  );
}

module.exports = {
  getBestProfession,
  getBestClients,
};
