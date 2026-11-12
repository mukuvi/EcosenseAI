export function parseApiError(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  const fieldErrors = {};

  if (Array.isArray(data?.errors)) {
    data.errors.forEach((item) => {
      if (item?.path && item?.msg) {
        if (!fieldErrors[item.path]) fieldErrors[item.path] = item.msg;
      }
    });
  }

  const message =
    data?.error ||
    Object.values(fieldErrors)[0] ||
    fallback;

  return { message, fieldErrors };
}
