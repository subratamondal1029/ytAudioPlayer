class ApiResponse {
  constructor(message, code, data) {
    this.success = true;
    this.message = message;
    this.code = code;
    this.data = data;
  }
}

export default ApiResponse;
