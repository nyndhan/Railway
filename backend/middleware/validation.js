const Joi = require('joi');

// Common validation schemas
const schemas = {
  qrCode: Joi.string().min(10).max(100).required(),
  componentType: Joi.string().valid('ERC', 'RPD', 'LNR').required(),
  manufacturer: Joi.string().min(2).max(100).required(),
  batchNumber: Joi.string().min(1).max(50).required(),
  trackSection: Joi.string().max(50).optional(),
  kmPost: Joi.number().min(0).max(10000).optional(),
  status: Joi.string().valid('Active', 'Inactive', 'Replaced', 'Damaged').optional(),
  coordinates: {
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional()
  }
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Request validation failed',
        errors
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Specific validation schemas for Flutter integration
const validationSchemas = {
  generateQR: Joi.object({
    component_type: schemas.componentType,
    manufacturer: schemas.manufacturer,
    batch_number: schemas.batchNumber,
    manufacturing_date: Joi.date().optional(),
    track_section: schemas.trackSection,
    km_post: schemas.kmPost
  }),

  recordScan: Joi.object({
    qrCode: schemas.qrCode,
    scannedBy: Joi.string().default('mobile_user'),
    location: Joi.string().default('Field Location'),
    deviceInfo: Joi.object().optional(),
    latitude: schemas.coordinates.latitude,
    longitude: schemas.coordinates.longitude
  }),

  updateComponent: Joi.object({
    manufacturer: schemas.manufacturer.optional(),
    batch_number: schemas.batchNumber.optional(),
    installation_date: Joi.date().optional(),
    track_section: schemas.trackSection,
    km_post: schemas.kmPost,
    status: schemas.status,
    warranty_months: Joi.number().min(0).max(120).optional()
  }),

  bulkGenerate: Joi.object({
    count: Joi.number().min(1).max(100).default(10),
    component_type: Joi.string().valid('ERC', 'RPD', 'LNR', 'random').default('ERC'),
    manufacturer: Joi.string().default('Demo Manufacturer')
  }),

  componentQuery: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(50),
    component_type: Joi.string().valid('ERC', 'RPD', 'LNR').optional(),
    manufacturer: Joi.string().optional(),
    status: Joi.string().valid('Active', 'Inactive', 'Replaced', 'Damaged').optional(),
    search: Joi.string().optional()
  })
};

module.exports = {
  validate,
  schemas: validationSchemas
};
