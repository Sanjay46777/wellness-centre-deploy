import AuthScreen from '@/components/AuthScreen';

export default function HeadRegisterScreen() {
  return (
    <AuthScreen
      role="head_counsellor"
      mode="register"
      title="Head Admin Registration"
      description="Request a Head Admin account. Your request will be reviewed by the Admin."
      extraFields={[
        { name: 'full_name', label: 'Full Name', placeholder: 'Dr. Rajesh Menon', required: true, autoCapitalize: 'words' },
        { name: 'phone', label: 'Phone Number', placeholder: '+1 234 567 8900', required: false },
      ]}
      alternateLink={{ href: '/head-login', label: 'Already have an account? Sign in' }}
    />
  );
}
