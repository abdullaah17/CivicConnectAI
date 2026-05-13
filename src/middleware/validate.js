/**
 * Zod validation middleware factory.
 * Parses req.body against the provided schema and replaces it with the parsed output.
 * Throws ZodError on failure — caught by globalErrorHandler.
 */
const validate = (schema) => (req, res, next) => {
  req.body = schema.parse(req.body);
  next();
};

module.exports = validate;
