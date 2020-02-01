export function promisify(f: any, context?: any, errorFirst?: boolean) {
    const ctx = context || null;
    return function (...args: any[]) {
        return new Promise(function (resolve, reject) {
            f.call(ctx, ...(args as any), function (...args: any[]) {
                if (errorFirst) {
                    const err = args[0];
                    if (err === null || err === undefined) {
                        resolve(args.slice(1));
                    } else {
                        reject(err);
                    }
                } else {
                    const err = args
                        ? args.find((a: any) => a instanceof Error)
                        : null;
                    if (err) {
                        reject(err);
                    } else {
                        resolve(args);
                    }
                }
            });
        });
    };
}