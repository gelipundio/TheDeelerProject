const { UNHANDLED_ERROR } = require("./errors");

function handleError(res, error) {
  if (!error || !error.status) {
    console.log("ERROR:", error);
    return res.status(500).send(UNHANDLED_ERROR);
  }
  return res.status(error.status).send(error);
}

module.exports = {
  handleError,
};
