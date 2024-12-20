class ApiResponse {
  constructor(message = "success", code = 200, data = {}) {
    this.success = true;
    this.message = message;
    this.code = code;
    this.data = data;
  }
}

export default ApiResponse;
