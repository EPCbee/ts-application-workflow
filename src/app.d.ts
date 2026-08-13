// src/app.d.ts
declare global {
  type Application = import('$lib/types/application').Application;
  type Applicant = import('$lib/types/application').Applicant;
  type ApplicationType = import('$lib/types/application').ApplicationType;
}