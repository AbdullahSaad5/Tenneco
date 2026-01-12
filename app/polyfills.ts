if (!Array.prototype.at) {
  Array.prototype.at = function (n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}

if (!Promise.allSettled) {
  Promise.allSettled = function <T>(promises: Promise<T>[]) {
    return Promise.all(
      promises.map((p) =>
        Promise.resolve(p)
          .then((value) => ({ status: "fulfilled" as const, value }))
          .catch((reason) => ({ status: "rejected" as const, reason }))
      )
    );
  };
}

if (!Promise.withResolvers) {
  Promise.withResolvers = function <T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason: unknown) => void;
  } {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
