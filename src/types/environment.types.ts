export enum Environment {
  DEV = 'dev',
  QA = 'qa',
  STAGE = 'stage',
  PROD = 'prod',
}

export const SUPPORTED_ENVIRONMENTS: ReadonlyArray<Environment> = [
  Environment.DEV,
  Environment.QA,
  Environment.STAGE,
  Environment.PROD,
];

export const DEFAULT_ENVIRONMENT: Environment = Environment.DEV;

export type EnvironmentName = `${Environment}`;
