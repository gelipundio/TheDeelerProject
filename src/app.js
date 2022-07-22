const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const app = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

// utils
const { CONTRACT_TYPES } = require("./utils/constants");
const { handleError } = require("./utils/errorHandler");

// controllers
const ContractsController = require("./controllers/contracts");
const JobsController = require("./controllers/jobs");
const BalanceController = require("./controllers/balances");
const AdminController = require("./controllers/admin");

// routes
app.get("/profile", getProfile, async (req, res) => {
  try {
    res.json(req.profile);
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/contracts/:id", getProfile, async (req, res) => {
  try {
    const { Contract: ContractModel } = req.app.get("models");
    const { id } = req.params;

    const contract = await ContractsController.getById(
      { ContractModel },
      {
        profileId: req.profile.id,
        contractId: id,
        profileType: req.profile.type,
      }
    );

    if (!contract) return res.status(404).end();
    res.json(contract);
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/contracts", getProfile, async (req, res) => {
  try {
    const { Contract: ContractModel } = req.app.get("models");
    const { type: profileType, id: profileId } = req.profile;

    const contracts = await ContractsController.getAll(
      { ContractModel },
      { profileId, profileType, excludeStatus: CONTRACT_TYPES.terminated }
    );

    res.json(contracts);
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/jobs/unpaid", getProfile, async (req, res) => {
  try {
    const { Job: JobModel, Contract: ContractModel } = req.app.get("models");
    const { type: profileType, id: profileId } = req.profile;

    const jobs = await JobsController.getUnpaid(
      { JobModel, ContractModel },
      { profileId, profileType }
    );

    res.json(jobs);
  } catch (err) {
    handleError(res, err);
  }
});

app.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
  try {
    const {
      Job: JobModel,
      Contract: ContractModel,
      Profile: ProfileModel,
    } = req.app.get("models");
    const { job_id: jobId } = req.params;

    await JobsController.payJob(
      { JobModel, ContractModel, ProfileModel },
      { profile: req.profile, jobId }
    );

    res.status(200).end();
  } catch (err) {
    handleError(res, err);
  }
});

app.post("/balances/deposit/:userId", getProfile, async (req, res) => {
  try {
    const {
      Job: JobModel,
      Contract: ContractModel,
      Profile: ProfileModel,
    } = req.app.get("models");
    const { userId } = req.params;
    const { deposit } = req.body;

    await BalanceController.increaseBalance(
      { JobModel, ContractModel, ProfileModel },
      { userId, deposit }
    );

    res.status(200).end();
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/admin/best-profession", getProfile, async (req, res) => {
  try {
    const {
      Job: JobModel,
      Contract: ContractModel,
      Profile: ProfileModel,
    } = req.app.get("models");
    const { start, end } = req.query;

    const bestProfession = await AdminController.getBestProfession(
      { JobModel, ContractModel, ProfileModel },
      { start, end }
    );
    res.json({ bestProfession });
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/admin/best-clients", getProfile, async (req, res) => {
  try {
    const {
      Job: JobModel,
      Contract: ContractModel,
      Profile: ProfileModel,
    } = req.app.get("models");
    const { start, end, limit = 2 } = req.query;

    const bestClients = await AdminController.getBestClients(
      { JobModel, ContractModel, ProfileModel },
      { start, end, limit }
    );
    res.json(bestClients);
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = app;
