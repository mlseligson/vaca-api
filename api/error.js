export class StatusError extends Error {
  constructor({message = "", status}) {
    super(message);
    this.status = status;
  }
}

export default (err, req, res, next) => {
  if (err.status)
    res.status(err.status).json(err);
  else
    res.status(500).json(err);

  next();
};