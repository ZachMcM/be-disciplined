import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useCountdown } from '@/hooks/useCountdown';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { toast } from 'sonner-native';
import * as z from 'zod';

const EmailSchema = z.object({
  email: z.email(),
});

export default function AuthPage() {
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
      className="flex-1 items-center bg-background">
      <View className="flex w-full flex-col items-center gap-4 p-8">
        {step === 0 ? (
          <Fragment>
            <Text className="text-xl font-bold">What's your email?</Text>
            <Controller
              control={emailControl}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="flex w-full flex-col gap-2">
                  <Input
                    autoFocus
                    placeholder="johndoe@example.com"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    className={cn(error && 'border-destructive', 'rounded-full')}
                    textContentType="emailAddress"
                    autoComplete="email"
                    autoCapitalize="none"
                    value={value}
                    onSubmitEditing={handleEmailSubmit(onSubmitEmail)}
                    keyboardType="email-address"
                  />
                  {error && (
                    <Text className="text-sm font-medium text-destructive">{error.message}</Text>
                  )}
                </View>
              )}
              name="email"
            />
            <Text className="text-center text-xs font-medium text-muted-foreground">
              By continuing, you agree to our Privacy Policy and Terms of Service
            </Text>
            <Button className="w-full" size="lg" onPress={handleEmailSubmit(onSubmitEmail)}>
              <Text>Continue</Text>
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <Text className="text-xl font-bold">Verify your email</Text>
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
              className="rounded-full"
            />
            <Button
              variant="link"
              size="sm"
              disabled={countdown > 0}
              onPress={() => {
                sendOTP(email);
                restartCountdown();
              }}>
              <Text className="text-center text-xs">
                Didn't receive the code? Resend{' '}
                {countdown > 0 ? <Text className="text-xs">({countdown})</Text> : null}
              </Text>
            </Button>
            <View className="flex w-full flex-row items-center gap-2">
              <Button
                variant="outline"
                onPress={() => setStep(0)}
                size="lg"
                className="flex-1">
                <Icon as={ArrowLeftIcon} size={18} />
                <Text>Back</Text>
              </Button>
              <Button className="flex-1" disabled={isPending} onPress={onSubmitOtp} size="lg">
                <Text>Continue</Text>
                {isPending && <ActivityIndicator size="small" className="text-primary-foreground" />}
              </Button>
            </View>
          </Fragment>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
