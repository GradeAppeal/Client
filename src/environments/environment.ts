export const environment = {
  production: false,
  supabaseUrl: process.env['SUPABASE_URL'] as string,
  serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] as string,
};
