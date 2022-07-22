const { USER_TYPES, CONTRACT_TYPES } = require("../utils/constants");
const { Op } = require("sequelize");

function getById({ ContractModel }, { profileId, profileType, contractId }) {
  const where = {
    id: contractId,
  };
  if (profileType === USER_TYPES.client) {
    where.ClientId = profileId;
  } else {
    where.ContractorId = profileId;
  }
  return ContractModel.findOne({ where });
}

function getAll(
  { ContractModel },
  { profileId, profileType, status = null, excludeStatus = null }
) {
  const where = {
    [profileType === USER_TYPES.client ? "ClientId" : "ContractorId"]:
      profileId,
  };
  if (status) {
    where.status = status;
  }
  if (excludeStatus) {
    where[Op.not] = {
      status: excludeStatus,
    };
  }
  return ContractModel.findAll({ where });
}

module.exports = {
  getById,
  getAll,
};
