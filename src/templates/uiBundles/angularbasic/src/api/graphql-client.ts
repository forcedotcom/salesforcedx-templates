/**
 * Thin GraphQL client using @salesforce/sdk-data.
 * SDK expects: data.graphql({ query, variables, operationName })
 */
import { createDataSDK } from '@salesforce/sdk-data';

export async function executeGraphQL<TData, TVariables>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  const data = await createDataSDK();

  const response = await (data as any).graphql({ query, variables });

  if (!response) {
    throw new Error('GraphQL response is undefined');
  }

  if (response?.errors?.length) {
    const msg = response.errors.map((e: { message: string }) => e.message).join('; ');
    throw new Error(`GraphQL Error: ${msg}`);
  }

  return response.data;
}
