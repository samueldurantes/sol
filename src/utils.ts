type Success<T> = {
  success: true;
  data: T;
  error: null;
};

type Failure<E> = {
  success: false;
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error as E,
    };
  }
}
