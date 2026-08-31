const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Les données envoyées sont invalides.",
        errors: result.error.issues,
      });
    }

    req.body = result.data;

    next();
  };
};

module.exports = validate;
