export default function useCaptcha() {
  const formCaptcha = ref(null as any);
  const isRequestInProgress = ref(false);
  const isSendEmailCofirmBtnEnabled = ref(false);

  // REGION Captcha
  function onCaptchaError(error: string) {
    isRequestInProgress.value = false;
    isSendEmailCofirmBtnEnabled.value = false;
  }

  function onCaptchaChallengeExpire(error: string) {
    isRequestInProgress.value = false;
    isSendEmailCofirmBtnEnabled.value = false;
  }

  function onCaptchaExpire(error: string) {
    isRequestInProgress.value = false;
    isSendEmailCofirmBtnEnabled.value = false;
  }

  function onCaptchaVerify(token: any, eKey: any) {
    formCaptcha.value = { token, eKey };
    isSendEmailCofirmBtnEnabled.value = true;
  }

  function onCaptchaClose() {
    isRequestInProgress.value = false;
    isSendEmailCofirmBtnEnabled.value = false;
  }
  // END Captcha

  return {
    formCaptcha,
    isRequestInProgress,
    isSendEmailCofirmBtnEnabled,
    onCaptchaChallengeExpire,
    onCaptchaClose,
    onCaptchaError,
    onCaptchaExpire,
    onCaptchaVerify,
  };
}
