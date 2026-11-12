export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (data?.error) return data.error;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors[0].msg || fallback;
  }
  return fallback;
}
