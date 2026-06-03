import {
  DEFAULT_ENVIRONMENT,
  Environment,
  SUPPORTED_ENVIRONMENTS,
} from '@app-types/environment.types';

export { DEFAULT_ENVIRONMENT, Environment, SUPPORTED_ENVIRONMENTS };

export function isEnvironment(value: string): value is Environment {
  return (SUPPORTED_ENVIRONMENTS as ReadonlyArray<string>).includes(value);
}

export function resolveEnvironment(envValue?: string): Environment {
  if (!envValue) {
    return DEFAULT_ENVIRONMENT;
  }

  const normalized = envValue.trim().toLowerCase();
  if (!isEnvironment(normalized)) {
    const supported = SUPPORTED_ENVIRONMENTS.join(', ');
    throw new Error(
      `Unsupported environment "${envValue}". Supported environments: ${supported}.`
    );
  }

  return normalized;
}
