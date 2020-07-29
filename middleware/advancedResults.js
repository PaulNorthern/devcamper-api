const advancedResults = (model, populate) => async (req, res, next) => {
  // func inside func
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  //console.log(reqQuery);

  // Create query string and Parse to JSON
  let queryStr = JSON.stringify(reqQuery);

  // If any Query Operators then add a $ to use operator in MongoDB
  queryStr = queryStr.replace(
    // /\b/, символ становится специальным символом, означающим границу слова.
    // следующий символ не является специальным и должен интерпретироваться буквально.
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  // find an Objects with such Queries
  query = model.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination (10 is a radix)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  qury = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

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

  // ressponse
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  // since its middleware
  next();
};

module.exports = advancedResults;
