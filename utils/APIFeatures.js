const AppError = require('./AppError');

class APIFeatures {
  constructor(query, queryReq) {
    this.query = query;
    this.queryReq = queryReq;
  }
  filter() {
    const queryObj = { ...this.queryReq };
    const excludedQuery = ['field', 'sort', 'page', 'limit'];
    excludedQuery.forEach((val) => delete queryObj[val]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.queryReq.sort) {
      const sortBy = this.queryReq.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createAt');
    }

    return this;
  }

  limitField() {
    if (this.queryReq.field) {
      const fields = this.queryReq.field.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = +this.queryReq.page || 1;
    const limit = +this.queryReq.limit || 100;
    const skip = (page - 1) * limit;

    if (page < 1) throw new AppError('Page not found!', 404);

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
