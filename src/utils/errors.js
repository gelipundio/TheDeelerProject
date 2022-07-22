module.exports = {
  UNHANDLED_ERROR: {
    status: 500,
    message: "Oops! something went wrong, try again",
  },
  JOB_NOT_PAYABLE: {
    status: 400,
    message: "You can not pay this job",
  },
  INSUFFICIENT_BALANCE: {
    status: 400,
    message: "You don't have enough money to pay this job",
  },
  JOB_NOT_FOUND: {
    status: 404,
    message: "Job not found",
  },
  CONTRACT_NOT_FOUND: {
    status: 404,
    message: "Contract not found",
  },
  DEPOSIT_ERROR: {
    status: 400,
    message: "You can't deposit more than 25% of your current debts",
  },
};
