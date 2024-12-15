class ApiError extends Error {
  constructor(message, code, error = []) {
    super(message);
    this.code = code;
    this.error = error;
    this.success = false;
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      code: this.code,
      error: this.error,
    };
  }
}

export default ApiError;
