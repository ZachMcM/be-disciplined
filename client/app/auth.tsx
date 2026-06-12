import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useCountdown } from '@/hooks/useCountdown';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toast } from 'sonner-native';
import * as z from 'zod';

const EmailSchema = z.object({
  email: z.email(),
});

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  field: {
    width: '100%',
    flexDirection: 'column',
    gap: 8,
  },
  inputRounded: {
    borderRadius: theme.radius.full,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.destructive,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.mutedForeground,
  },
  fullWidth: {
    width: '100%',
  },
  resendText: {
    textAlign: 'center',
    fontSize: 12,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
}));

export default function AuthPage() {
  const { theme } = useUnistyles();
  const [isPending, setIsPending] = useState(false);
  const { countdown, restartCountdown } = useCountdown(30);
  const [step, setStep] = useState<0 | 1>(0);
  const [otp, setOtp] = useState('');

  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    watch: watchEmail,
  } = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
  });

  const { email } = watchEmail();

  const onSubmitOtp = async () => {
    setIsPending(true);
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    setIsPending(false);
    if (error && error.message) {
      toast.error(error.message, { position: 'bottom-center' });
    }
  };

  const onSubmitEmail = ({ email }: z.infer<typeof EmailSchema>) => {
    sendOTP(email);
    restartCountdown();
    setStep(1);
  };

  async function sendOTP(email: string) {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: 'sign-in',
    });
    if (error) {
      toast.error(error.message ?? 'Error sending OTP', { position: 'bottom-center' });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}>
      <View style={styles.container}>
        {step === 0 ? (
          <Fragment>
            <Text style={styles.title}>What's your email?</Text>
            <Controller
              control={emailControl}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.field}>
                  <Input
                    autoFocus
                    placeholder="johndoe@example.com"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    style={[styles.inputRounded, error && styles.inputError]}
                    textContentType="emailAddress"
                    autoComplete="email"
                    autoCapitalize="none"
                    value={value}
                    onSubmitEditing={handleEmailSubmit(onSubmitEmail)}
                    keyboardType="email-address"
                  />
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </View>
              )}
              name="email"
            />
            <Text style={styles.disclaimer}>
              By continuing, you agree to our Privacy Policy and Terms of Service
            </Text>
            <Button style={styles.fullWidth} size="lg" onPress={handleEmailSubmit(onSubmitEmail)}>
              <Text>Continue</Text>
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <Text style={styles.title}>Verify your email</Text>
            <Input
              value={otp}
              onChangeText={setOtp}
              autoFocus
              placeholder="123456"
              autoCapitalize="none"
              returnKeyType="send"
              keyboardType="number-pad"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              onSubmitEditing={onSubmitOtp}
              style={styles.inputRounded}
            />
            <Button
              variant="link"
              size="sm"
              disabled={countdown > 0}
              onPress={() => {
                sendOTP(email);
                restartCountdown();
              }}>
              <Text style={styles.resendText}>
                Didn't receive the code? Resend{' '}
                {countdown > 0 ? <Text style={styles.resendText}>({countdown})</Text> : null}
              </Text>
            </Button>
            <View style={styles.row}>
              <Button variant="outline" onPress={() => setStep(0)} size="lg" style={styles.flex1}>
                <Icon as={ArrowLeftIcon} size={18} />
                <Text>Back</Text>
              </Button>
              <Button style={styles.flex1} disabled={isPending} onPress={onSubmitOtp} size="lg">
                <Text>Continue</Text>
                {isPending && (
                  <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
                )}
              </Button>
            </View>
          </Fragment>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
