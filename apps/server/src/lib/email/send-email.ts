const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
}

export  { sendEmail };