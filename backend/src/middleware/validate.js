

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.validate(req.body);
    if (!result.valid) {
      return res.status(400).json({
        error: true,
        field: result.field,
        message: result.message,
      });
    }
    next();
  };
}
