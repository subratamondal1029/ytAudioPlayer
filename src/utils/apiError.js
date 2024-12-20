class ApiError extends Error {
  constructor(message = "Something went wrong", code = 500, errors = []) {
    super(message);
    this.code = code;
    this.errors = errors;
    this.success = false;
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      code: this.code,
      errors: this.errors,
      data: null,
    };
  }
}

export default ApiError;
