import AuthScreen from '@/components/AuthScreen';

export default function StudentLoginScreen() {
  return (
    <AuthScreen
      role="student"
      mode="login"
      title="Student Login"
      description="Sign in to submit feedback, track your mood, and access wellness resources."
      alternateLink={{ href: '/student-register', label: "Don't have an account? Register" }}
      demoAccount={{ email: 'student-demo@wellness.local', password: 'StudentDemo1!', label: 'Demo Student' }}
    />
  );
}
