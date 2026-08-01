import AuthScreen from '@/components/AuthScreen';

export default function HeadLoginScreen() {
  return (
    <AuthScreen
      role="head_counsellor"
      mode="login"
      title="Head Admin Login"
      description="Sign in to view all feedback, manage counsellors, and review analytics."
      alternateLink={{ href: '/head-register', label: 'Request a head admin account' }}
      demoAccount={{ email: 'wo@smail.iitm.ac.in', password: '6hxkTs&1*CuE&ot@', label: 'Demo Head Admin' }}
    />
  );
}
