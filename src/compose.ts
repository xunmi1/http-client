type TupleToUnion<T extends any[]> = T[number];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type Next = () => Promise<any>;
type Middleware<T> = (context: any, next: Next) => Promise<T>;

type Composed<T extends any[]> = (context: unknown, next?: Next) => UnionToIntersection<ReturnType<TupleToUnion<T>>>;

const error = new Error('next() should not be called multiple times in one middleware');

const compose = <T extends Middleware<any>[]>(stack: T): Composed<T> => (context, next) => {
  let count = -1;
  const step = (i: number): Promise<any> => {
    if (i <= count) return Promise.reject(error);
    count = i;
    const func = stack[i] ?? next;
    if (!func) return Promise.resolve();

    try {
      return Promise.resolve(func(context, () => step(i + 1)));
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return step(0) as ReturnType<Composed<T>>;
};

export default compose;
