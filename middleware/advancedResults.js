const advancedResult = (model, populate) => async (req, res, next) => {
  let query;

  // copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);

  // create Mongoose operators ($gt, $gte, etc.)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resources
  query = model.find(JSON.parse(queryStr));

  // SELECT FIELDS (specific fields needs to be extracted)
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" "); // get all columns to be seleted
    query = query.select(fields);
  }

  // SORT results (sorting order of the output returned)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" "); // get sorting columns
    query = query.sort(sortBy);
  } else {
    // sort the result in a default order: descending createdAt
    query = query.sort("-createdAt");
  }

  // Pagination (1 page and 1 item per page by default)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(); // Mongoose method

  query = query.skip(startIndex).limit(limit);

  // If populate is needed
  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const models = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // To pass result through res, so it can be fetch by functions running after this middleware function
  res.advancedResults = {
    success: true,
    count: models.length,
    pagination,
    data: models,
  };

  next();
};

module.exports = advancedResult;
