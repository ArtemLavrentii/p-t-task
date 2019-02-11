export default function RouteErrorProcessor(next) {
  return function errorHandler(req, h, ...rest) {
    try {
      return next(req, h, ...rest);
    } catch (e) {
      if (e instanceof Error) {
        return {
          result: 'error',
          kind: 'user',
          message: e.message,
        }
      }
      return {
        result: 'error',
        kind: 'internal',
      }
    }
  }
}