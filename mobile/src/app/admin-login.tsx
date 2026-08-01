import AuthScreen from '@/components/AuthScreen';

export default function AdminLoginScreen() {
  return (
    <AuthScreen
      role="admin"
      mode="login"
      title="Admin Login"
      description="Sign in to manage counsellor accounts, roles, and platform exports."
      alternateLink={{ href: '/role-select', label: 'Not an admin? Choose another portal' }}
      demoAccount={{ email: 'wellness1@smail.iitm.ac.in', password: '0&nMlqX3&yFkkHVx', label: 'Demo Admin' }}
    />
  );
}
