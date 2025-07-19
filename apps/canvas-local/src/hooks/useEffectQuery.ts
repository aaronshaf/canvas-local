import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { Effect } from 'effect';

type EffectQueryOptions<T, E> = Omit<UseQueryOptions<T, Error>, 'queryFn'> & {
  queryFn: () => Effect.Effect<T, E, never>;
};

type EffectMutationOptions<TData, TError, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
> & {
  mutationFn: (variables: TVariables) => Effect.Effect<TData, TError, never>;
};

export function useEffectQuery<T, E>({ queryFn, ...options }: EffectQueryOptions<T, E>) {
  return useQuery({
    ...options,
    queryFn: async () => {
      try {
        return await Effect.runPromise(queryFn());
      } catch (error) {
        // Convert Effect errors to regular errors for React Query
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(String(error));
      }
    },
  });
}

export function useEffectMutation<TData, TError, TVariables = void>({
  mutationFn,
  ...options
}: EffectMutationOptions<TData, TError, TVariables>) {
  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      try {
        return await Effect.runPromise(mutationFn(variables));
      } catch (error) {
        // Convert Effect errors to regular errors for React Query
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(String(error));
      }
    },
  });
}
