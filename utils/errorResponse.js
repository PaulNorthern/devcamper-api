class ErrorResponse extends Error {
  constructor(message, statusCode) {
    // вызвать конструктор Error'a
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
