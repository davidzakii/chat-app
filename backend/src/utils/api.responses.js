export function successResponse(data, message = "Success") {
  return {
    isPass: true,
    data,
    message,
  };
}

export function errorResponse(message, status = 400) {
  return {
    isPass: false,
    data: null,
    message,
    status,
  };
}
