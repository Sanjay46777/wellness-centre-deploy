import AuthScreen from '@/components/AuthScreen';

export default function StudentRegisterScreen() {
  return (
    <AuthScreen
      role="student"
      mode="register"
      title="Student Registration"
      description="Create a student account to access the Wellness Centre portal."
      extraFields={[
        { name: 'full_name', label: 'Full Name (optional)', placeholder: 'Jane Doe', required: false, autoCapitalize: 'words' },
        { name: 'student_id', label: 'Student / Institution ID', placeholder: 'STU2026001', required: true },
        { name: 'phone', label: 'Phone Number (optional)', placeholder: '+1 234 567 8900', required: false },
      ]}
      alternateLink={{ href: '/student-login', label: 'Already have an account? Sign in' }}
      demoData={{
        email: 'student-register-demo@wellness.local',
        password: 'StudentDemo1!',
        full_name: 'Demo Student',
        student_id: 'DEMO2026002',
        phone: '+91 98765 43210',
        label: 'Fill demo data',
      }}
    />
  );
}
